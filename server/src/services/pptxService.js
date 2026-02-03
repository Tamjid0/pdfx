import JSZip from 'jszip';
import { parseStringPromise } from 'xml2js';
import logger from '../utils/logger.js';
import fs from 'fs';

// Helper to strip XML namespaces (e.g. p:presentation -> presentation)
const stripPrefix = (name) => name.split(':').pop();

/**
 * Extracts slides from a PPTX file buffer.
 * @param {Buffer} buffer - The PPTX file buffer.
 * @returns {Promise<Array<{title: string, content: string}>>} - Array of slide objects.
 */
export async function extractSlides(buffer) {
    const zip = await JSZip.loadAsync(buffer);
    const slides = [];

    // 1. Try Parse presentation.xml to get slide order (rels)
    try {
        const presentationXml = await zip.file("ppt/presentation.xml").async("text");
        const presentation = await parseStringPromise(presentationXml, { tagNameProcessors: [stripPrefix] });

        // Safety check for empty or malformed presentation
        const slideIdList = presentation?.presentation?.slideIdLst?.[0]?.slideId || [];

        // We need the rels to map rId to filename.
        const relsFile = zip.file("ppt/_rels/presentation.xml.rels");
        if (relsFile) {
            const relsXml = await relsFile.async("text");
            const rels = await parseStringPromise(relsXml, { tagNameProcessors: [stripPrefix], attrNameProcessors: [stripPrefix] });

            const relMap = {};
            const relationships = rels.Relationships?.Relationship || [];
            relationships.forEach(rel => {
                // Attribute names might be stripped too depending on processor, but attributes usually don't have prefix except xmlns
                // attributes are in `$` key.
                // We used attrNameProcessors: [stripPrefix] so Id -> Id, Target -> Target.
                relMap[rel.$.Id] = rel.$.Target;
            });

            for (const slideIdEntry of slideIdList) {
                // slideIdEntry.$['id'] (if stripped r:id -> id)
                const rId = slideIdEntry.$['id'];
                const target = relMap[rId];

                if (!target) continue;

                // Target is usually like "slides/slide1.xml" or "/ppt/slides/slide1.xml"
                const slidePath = target.startsWith('/') ? target.substring(1) : `ppt/${target}`;

                // Handle case where path might be relative to ppt/
                const fullPath = slidePath.startsWith('ppt/') ? slidePath : `ppt/${slidePath}`;

                const slideFile = zip.file(fullPath);
                if (slideFile) {
                    const slideXml = await slideFile.async("text");
                    const slideData = await parseSlide(slideXml);
                    slides.push(slideData);
                }
            }
        }
    } catch (e) {
        logger.error(`Error parsing presentation relationship structure: ${e.message}`);
    }

    // FALLBACK: If standard parsing found nothing, just scan for slideN.xml files
    if (slides.length === 0) {

        // Find all files that look like slides/slide123.xml
        // Note: zip.files contains raw paths like "ppt/slides/slide1.xml"
        const slideFiles = Object.keys(zip.files).filter(fileName =>
            fileName.match(/ppt\/slides\/slide\d+\.xml/) || fileName.match(/slides\/slide\d+\.xml/)
        );

        // Sort by number: slide1, slide2, slide10
        slideFiles.sort((a, b) => {
            const matchA = a.match(/slide(\d+)\.xml/);
            const matchB = b.match(/slide(\d+)\.xml/);
            const numA = matchA ? parseInt(matchA[1]) : 0;
            const numB = matchB ? parseInt(matchB[1]) : 0;
            return numA - numB;
        });


        for (const fileName of slideFiles) {
            const slideXml = await zip.file(fileName).async("text");
            const slideData = await parseSlide(slideXml);
            slides.push(slideData);
        }
    }

    return slides;
}

async function parseSlide(xmlContent) {
    const result = await parseStringPromise(xmlContent, { tagNameProcessors: [stripPrefix] });
    let title = "Untitled Slide";
    let contentLines = [];

    // Traverse the XML shape tree
    // sld -> cSld -> spTree -> sp (shapes)
    const spTree = result?.sld?.cSld?.[0]?.spTree?.[0];
    const shapes = spTree?.sp || [];

    for (const shape of shapes) {
        // Check for text body
        if (shape.txBody) {
            const txBody = shape.txBody[0];
            const paragraphs = txBody.p || [];
            let shapeText = "";

            for (const p of paragraphs) {
                // r is a run of text
                const runs = p.r || [];
                let pText = "";
                for (const r of runs) {
                    if (r.t) {
                        // t is the text content
                        let tContent = r.t[0];
                        // Sometimes t is an object with _ if preserveWhitespace was on, but default is string or simple obj
                        if (typeof tContent === 'object' && tContent._) tContent = tContent._;
                        pText += tContent;
                    }
                }
                if (pText.trim()) {
                    shapeText += pText + "\n";
                }
            }

            shapeText = shapeText.trim();
            if (!shapeText) continue;

            // Heuristic for Title:
            // 1. Valid placeholder type 'ctrTitle' or 'title'
            const nvSpPr = shape.nvSpPr?.[0];
            let isTitle = false;

            if (nvSpPr?.nvPr) {
                const ph = nvSpPr.nvPr[0].ph;
                if (ph) {
                    const type = ph[0].$.type;
                    if (type === 'ctrTitle' || type === 'title') {
                        isTitle = true;
                    }
                }
            }

            if (isTitle) {
                title = shapeText;
            } else {
                contentLines.push(shapeText);
            }
        }
    }

    return {
        title: title !== "Untitled Slide" ? title : (contentLines[0] ? contentLines.shift() : "Untitled Slide"),
        content: contentLines.join("\n")
    };
}
