import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import path from 'path';
import logger from '../../utils/logger.js';
import { DocumentRoot, DocumentPage, TextNode, ImageNode } from '../../models/DocumentGraph.js';

const stripPrefix = (name) => name.split(':').pop();

/**
 * Adapter for extracting PPTX into the unified graph.
 */
export class PptxExtractor {
    constructor() { }

    /**
     * Extracts PPTX content.
     * @param {Buffer} buffer 
     * @param {string} originalName 
     * @returns {Promise<DocumentRoot>}
     */
    async extract(buffer, originalName) {
        const zip = await JSZip.loadAsync(buffer);
        const docGraph = new DocumentRoot(originalName, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');

        let slideWidth = 9144000;
        let slideHeight = 5143500;

        // 1. Get Dimensions
        try {
            const presentationXml = await zip.file("ppt/presentation.xml")?.async("text");
            if (presentationXml) {
                const presentation = await parseStringPromise(presentationXml, { tagNameProcessors: [stripPrefix] });
                const sldSz = presentation?.presentation?.sldSz?.[0]?.$;
                if (sldSz) {
                    slideWidth = parseInt(sldSz.cx) || slideWidth;
                    slideHeight = parseInt(sldSz.cy) || slideHeight;
                }
            }
        } catch (e) {
            // Failed to parse dimensions
        }

        // 2. Find Slides
        const slideFiles = Object.keys(zip.files).filter(fileName =>
            fileName.match(/ppt\/slides\/slide\d+\.xml/) || fileName.match(/slides\/slide\d+\.xml/)
        );

        slideFiles.sort((a, b) => {
            const matchA = a.match(/slide(\d+)\.xml/);
            const matchB = b.match(/slide(\d+)\.xml/);
            return (matchA ? parseInt(matchA[1]) : 0) - (matchB ? parseInt(matchB[1]) : 0);
        });

        // 3. Process Each Slide
        let slideIndex = 0;
        for (const fileName of slideFiles) {
            try {
                const page = new DocumentPage(slideIndex, { width: slideWidth, height: slideHeight }, 'slide');

                // Parse relationships for images
                const dir = path.dirname(fileName);
                const base = path.basename(fileName);
                const relsPath = `${dir}/_rels/${base}.rels`;
                const relMap = {};

                const relsFile = zip.file(relsPath);
                if (relsFile) {
                    const relsXml = await relsFile.async("text");
                    const rels = await parseStringPromise(relsXml, { tagNameProcessors: [stripPrefix], attrNameProcessors: [stripPrefix] });
                    const relationships = rels.Relationships?.Relationship || [];
                    relationships.forEach(rel => { relMap[rel.$.Id] = rel.$.Target; });
                }

                // Parse XML with explicit children for Z-order
                const slideXml = await zip.file(fileName).async("text");
                const result = await parseStringPromise(slideXml, {
                    tagNameProcessors: [stripPrefix],
                    attrNameProcessors: [stripPrefix],
                    explicitChildren: true,
                    preserveChildrenOrder: true
                });

                // Traverse and normalize
                await this.processSlideNodes(result, page, zip, relMap, slideWidth, slideHeight);

                docGraph.addPage(page);
                slideIndex++;

            } catch (err) {
                logger.error(`Error parsing slide ${fileName}: ${err.message}`);
                // Add empty page on error to maintain count
                docGraph.addPage(new DocumentPage(slideIndex, { width: slideWidth, height: slideHeight }, 'slide'));
                slideIndex++;
            }
        }

        return docGraph;
    }

    async processSlideNodes(result, page, zip, relMap, slideWidth, slideHeight) {
        const getChildren = (node) => node?.$$ || [];
        const findChild = (node, name) => getChildren(node).find(c => c['#name'] === name);

        const sld = result.sld || result['p:sld'];
        if (!sld) return;

        const cSld = findChild(sld, 'cSld');
        if (!cSld) return;

        const spTree = findChild(cSld, 'spTree');
        if (!spTree) return;

        const processNodesRecursive = async (nodes, groupOffsetX = 0, groupOffsetY = 0, groupScaleX = 1, groupScaleY = 1) => {
            if (!nodes) return;

            for (const node of nodes) {
                const tagName = node['#name'];

                // TRANSFORM CALCULATION (Shared)
                let x = 0, y = 0, cx = 0, cy = 0;
                let chOffX = 0, chOffY = 0, chExtX = 1, chExtY = 1;

                // Helper to get Transform
                const getXfrm = (n, propName = 'spPr') => {
                    const pr = findChild(n, propName);
                    return pr ? findChild(pr, 'xfrm') : null;
                };

                // 1. GROUPS
                if (tagName === 'grpSp') {
                    const xfrm = getXfrm(node, 'grpSpPr');
                    if (xfrm) {
                        const off = findChild(xfrm, 'off');
                        const ext = findChild(xfrm, 'ext');
                        const chOff = findChild(xfrm, 'chOff');
                        const chExt = findChild(xfrm, 'chExt');
                        if (off && off.$) { x = parseInt(off.$.x); y = parseInt(off.$.y); }
                        if (ext && ext.$) { cx = parseInt(ext.$.cx); cy = parseInt(ext.$.cy); }
                        if (chOff && chOff.$) { chOffX = parseInt(chOff.$.x); chOffY = parseInt(chOff.$.y); }
                        if (chExt && chExt.$) { chExtX = parseInt(chExt.$.cx); chExtY = parseInt(chExt.$.cy); }
                    }

                    const scaleX = (chExtX && cx) ? (cx / chExtX) : 1;
                    const scaleY = (chExtY && cy) ? (cy / chExtY) : 1;
                    const grpAbsX = groupOffsetX + x;
                    const grpAbsY = groupOffsetY + y;

                    await processNodesRecursive(getChildren(node), grpAbsX - (chOffX * scaleX), grpAbsY - (chOffY * scaleY), scaleX * groupScaleX, scaleY * groupScaleY);
                }

                // 2. SHAPES (Text)
                else if (tagName === 'sp') {
                    const xfrm = getXfrm(node);
                    if (xfrm) {
                        const off = findChild(xfrm, 'off');
                        const ext = findChild(xfrm, 'ext');
                        if (off && off.$) { x = parseInt(off.$.x); y = parseInt(off.$.y); }
                        if (ext && ext.$) { cx = parseInt(ext.$.cx); cy = parseInt(ext.$.cy); }
                    }

                    const finalX = groupOffsetX + (x * groupScaleX);
                    const finalY = groupOffsetY + (y * groupScaleY);
                    const finalW = cx * groupScaleX;
                    const finalH = cy * groupScaleY;

                    const pctX = (finalX / slideWidth) * 100;
                    const pctY = (finalY / slideHeight) * 100;

                    const txBody = findChild(node, 'txBody');
                    if (txBody) {
                        const paragraphs = getChildren(txBody).filter(c => c['#name'] === 'p');
                        let fullText = "";

                        for (const p of paragraphs) {
                            const runs = getChildren(p).filter(c => c['#name'] === 'r');
                            for (const r of runs) {
                                const t = findChild(r, 't');
                                if (t && t._) fullText += t._;
                            }
                            fullText += "\n";
                        }

                        if (fullText.trim()) {
                            // Extract basic style from first run of first paragraph (simplification for Phase 1)
                            // Future: Extract rich text runs fully
                            page.addNode(new TextNode(
                                fullText.trim(),
                                {}, // TODO: Add rich formatting
                                { x: pctX, y: pctY, width: (finalW / slideWidth) * 100, height: (finalH / slideHeight) * 100 },
                                { slide: page.index }
                            ));
                        }
                    }
                }

                // 3. IMAGES
                else if (tagName === 'pic') {
                    const xfrm = getXfrm(node);
                    if (xfrm) {
                        const off = findChild(xfrm, 'off');
                        const ext = findChild(xfrm, 'ext');
                        if (off && off.$) { x = parseInt(off.$.x); y = parseInt(off.$.y); }
                        if (ext && ext.$) { cx = parseInt(ext.$.cx); cy = parseInt(ext.$.cy); }
                    }

                    const finalX = groupOffsetX + (x * groupScaleX);
                    const finalY = groupOffsetY + (y * groupScaleY);
                    const finalW = cx * groupScaleX;
                    const finalH = cy * groupScaleY;

                    const blipFill = findChild(node, 'blipFill');
                    const blip = blipFill ? findChild(blipFill, 'blip') : null;
                    let embedId = blip && blip.$ ? (blip.$.embed || blip.$.link) : null;

                    if (embedId && relMap[embedId]) {
                        // Image Extraction
                        const imgPath = relMap[embedId];
                        // Logic to find file in zip (simplified)
                        const relativePart = imgPath.replace('../', '').replace('ppt/', '');
                        // ... (Search logic same as previous service)
                        const pathsToCheck = [`ppt/${relativePart}`, `ppt/slides/${imgPath}`, `ppt/media/${path.basename(imgPath)}`, relativePart];
                        let imgFile = null;
                        for (const p of pathsToCheck) { if (zip.file(p)) { imgFile = zip.file(p); break; } }

                        if (imgFile) {
                            const imgBuffer = await imgFile.async("nodebuffer");
                            const base64 = imgBuffer.toString('base64');
                            const ext = path.extname(imgPath).toLowerCase();
                            const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
                            const dataUrl = `data:${mime};base64,${base64}`;

                            page.addNode(new ImageNode(
                                dataUrl,
                                'Slide Image',
                                { x: (finalX / slideWidth) * 100, y: (finalY / slideHeight) * 100, width: (finalW / slideWidth) * 100, height: (finalH / slideHeight) * 100 },
                                { slide: page.index }
                            ));
                        }
                    }
                }
            }
        };

        await processNodesRecursive(getChildren(spTree));
    }
}
