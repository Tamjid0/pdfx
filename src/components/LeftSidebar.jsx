'use client';
const _jsxFileName = "j:\\antigravity\\pdfx\\src\\components\\LeftSidebar.tsx";import React, { useState, useEffect } from "react";
import { fetchTemplates } from "../services/apiService";
import { useStore } from "../store/useStore";
import * as apiService from "../services/apiService";









const LeftSidebar = () => {
  const {
    stats,
    prompt,
    setPrompt,
    setView,
    setMode,
    htmlPreview,
    setHtmlPreview,
    setIsLoading,
  } = useStore();

  const [activeTab, setActiveTab] = useState("stats");
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const backToImport = () => {
    setView("import");
    setMode("editor");
  };

  const handleFormat = async () => {
    if (!htmlPreview) return;
    setIsLoading(true);
    try {
      const data = await apiService.formatContent(htmlPreview, prompt);
      setHtmlPreview(data.formattedHtml);
    } catch (error) {
      console.error("Error formatting content:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = async (templatePrompt) => {
    if (!htmlPreview) return;
    setIsLoading(true);
    try {
      const data = await apiService.formatContent(htmlPreview, templatePrompt);
      setHtmlPreview(data.formattedHtml);
    } catch (error) {
      console.error("Error applying template:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const getTemplates = async () => {
      try {
        const fetchedTemplates = await fetchTemplates();
        setTemplates(fetchedTemplates);
        setFilteredTemplates(fetchedTemplates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      }
    };
    getTemplates();
  }, []);

  useEffect(() => {
    let currentFiltered = templates;

    if (searchTerm) {
      currentFiltered = currentFiltered.filter(
        (template) =>
          template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredTemplates(currentFiltered);
  }, [searchTerm, templates]);

  return (
    React.createElement('aside', { className: "sidebar-left w-[320px] bg-[#111] border-r border-[#222] flex flex-col h-full overflow-hidden"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 89}}
      , React.createElement('div', { className: "left-sidebar-tabs flex-shrink-0 flex bg-[#1a1a1a] border-b border-[#333]"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 90}}
        , React.createElement('button', {
          className: `left-tab-btn flex-1 p-4 bg-none border-none text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${activeTab === "stats"
              ? "text-[#00ff88] border-b-2 border-[#00ff88] bg-[rgba(0,255,136,0.1)]"
              : "text-[#999] border-b-2 border-transparent hover:text-white hover:bg-[rgba(0,255,136,0.05)]"
            }`,
          onClick: () => setActiveTab("stats"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 91}}

          , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 98}}
            , React.createElement('path', { d: "M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"              , __self: this, __source: {fileName: _jsxFileName, lineNumber: 99}} )
          ), "Stats"

        )
        , React.createElement('button', {
          className: `left-tab-btn flex-1 p-4 bg-none border-none text-sm font-semibold cursor-pointer transition-all flex items-center justify-center gap-1.5 ${activeTab === "format"
              ? "text-[#00ff88] border-b-2 border-[#00ff88] bg-[rgba(0,255,136,0.1)]"
              : "text-[#999] border-b-2 border-transparent hover:text-white hover:bg-[rgba(0,255,136,0.05)]"
            }`,
          onClick: () => setActiveTab("format"), __self: this, __source: {fileName: _jsxFileName, lineNumber: 103}}

          , React.createElement('svg', { viewBox: "0 0 24 24"   , className: "w-4 h-4 fill-current"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 110}}
            , React.createElement('path', { d: "M4 15h16v-2H4v2zm0 4h16v-2H4v2zm0-8h16V9H4v2zm0-6v2h16V5H4z"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 111}} )
          ), "Format"

        )
      )

      , React.createElement('div', { className: "left-tab-content flex-grow overflow-y-auto p-5"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 117}}
        , activeTab === "stats" && (
          React.createElement('div', { className: "flex flex-col gap-4"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 119}}
            , React.createElement('button', {
              className: "back-btn w-full p-2.5 bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-sm cursor-pointer transition-all flex items-center gap-2 hover:bg-[#252525] hover:border-[#00ff88]"               ,
              onClick: backToImport, __self: this, __source: {fileName: _jsxFileName, lineNumber: 120}}

              , React.createElement('svg', {
                className: "w-4 h-4 fill-current"  ,
                viewBox: "0 0 24 24"   ,
                xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 124}}

                , React.createElement('path', { d: "M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 129}} )
              ), "Back to Import"

            )
            , React.createElement('div', { className: "stats-card bg-[#1a1a1a] border border-[#333] rounded-xl p-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 133}}
              , React.createElement('div', { className: "stats-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 134}}, "Content Stats"

              )
              , React.createElement('div', { className: "grid grid-cols-2 gap-3"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 137}}
                , React.createElement('div', { className: "stat-box text-center p-3 bg-[rgba(0,255,136,0.05)] rounded-lg"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 138}}
                  , React.createElement('span', { className: "stat-value text-2xl font-bold text-[#00ff88] block mb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 139}}
                    , stats.wordCount
                  )
                  , React.createElement('span', { className: "stat-label text-xs text-[#999] uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 142}}, "Words"

                  )
                )
                , React.createElement('div', { className: "stat-box text-center p-3 bg-[rgba(0,255,136,0.05)] rounded-lg"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 146}}
                  , React.createElement('span', { className: "stat-value text-2xl font-bold text-[#00ff88] block mb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 147}}
                    , stats.charCount
                  )
                  , React.createElement('span', { className: "stat-label text-xs text-[#999] uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 150}}, "Characters"

                  )
                )
                , React.createElement('div', { className: "stat-box text-center p-3 bg-[rgba(0,255,136,0.05)] rounded-lg"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 154}}
                  , React.createElement('span', { className: "stat-value text-2xl font-bold text-[#00ff88] block mb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 155}}
                    , stats.readTime
                  )
                  , React.createElement('span', { className: "stat-label text-xs text-[#999] uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 158}}, "Min Read"

                  )
                )
                , React.createElement('div', { className: "stat-box text-center p-3 bg-[rgba(0,255,136,0.05)] rounded-lg"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 162}}
                  , React.createElement('span', { className: "stat-value text-2xl font-bold text-[#00ff88] block mb-1"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 163}}
                    , stats.lineCount
                  )
                  , React.createElement('span', { className: "stat-label text-xs text-[#999] uppercase"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 166}}, "Lines"

                  )
                )
              )
            )
            , React.createElement('div', { className: "basic-tools-card bg-[#1a1a1a] border border-[#333] rounded-xl p-4"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 172}}
              , React.createElement('div', { className: "basic-tools-title text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-4"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 173}}, "Quick Tools" )
              , React.createElement('div', { className: "grid grid-cols-2 gap-2.5"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 174}}
                , React.createElement('div', { className: "tool-btn flex flex-col items-center justify-center p-3 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88] hover:text-white"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 175}}
                  , React.createElement('svg', { className: "w-6 h-6 mb-1.5 fill-[#999]"   , viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}}, React.createElement('path', { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"                                         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 176}} )), "Search"

                )
                , React.createElement('div', { className: "tool-btn flex flex-col items-center justify-center p-3 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88] hover:text-white"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 179}}
                  , React.createElement('svg', { className: "w-6 h-6 mb-1.5 fill-[#999]"   , viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}}, React.createElement('path', { d: "M15 21H9v-6H3v-2.83l14-14 2.83 2.83-14 14V18h5.17z"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 180}} )), "Highlight"

                )
                , React.createElement('div', { className: "tool-btn flex flex-col items-center justify-center p-3 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88] hover:text-white"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 183}}
                  , React.createElement('svg', { className: "w-6 h-6 mb-1.5 fill-[#999]"   , viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}}, React.createElement('path', { d: "M4 13h5v-2H4v2zm7 0h10v-2H11v2zm-7 5h7v-2H4v2zm9 0h8v-2h-8v2zM4 9h10V7H4v2zm11 0h5V7h-5v2z"      , __self: this, __source: {fileName: _jsxFileName, lineNumber: 184}} )), "Outline"

                )
                , React.createElement('div', { className: "tool-btn flex flex-col items-center justify-center p-3 bg-[#252525] border border-[#333] rounded-lg cursor-pointer transition-all text-[#ccc] text-xs text-center hover:bg-[rgba(0,255,136,0.1)] hover:border-[#00ff88] hover:text-white"                 , __self: this, __source: {fileName: _jsxFileName, lineNumber: 187}}
                  , React.createElement('svg', { className: "w-6 h-6 mb-1.5 fill-[#999]"   , viewBox: "0 0 24 24"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}}, React.createElement('path', { d: "M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 188}} )), "Notes"

                )
              )
            )
          )
        )

        , activeTab === "format" && (
          React.createElement('div', { className: "flex flex-col flex-grow h-full"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 197}}
            , React.createElement('div', { className: "p-5", __self: this, __source: {fileName: _jsxFileName, lineNumber: 198}}
              , React.createElement('div', { className: "format-search relative" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 199}}
                , React.createElement('svg', {
                  className: "search-icon absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 fill-[#666]"       ,
                  viewBox: "0 0 24 24"   ,
                  xmlns: "http://www.w3.org/2000/svg", __self: this, __source: {fileName: _jsxFileName, lineNumber: 200}}

                  , React.createElement('path', { d: "M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"                                         , __self: this, __source: {fileName: _jsxFileName, lineNumber: 205}} )
                )
                , React.createElement('input', {
                  type: "text",
                  className: "search-input w-full pl-10 pr-4 py-3 bg-[#1a1a1a] border border-[#333] rounded-lg text-white text-sm transition-all focus:outline-none focus:border-[#00ff88] focus:shadow-[0_0_0_3px_rgba(0,255,136,0.1)]"              ,
                  placeholder: "Search templates..." ,
                  value: searchTerm,
                  onChange: (e) => setSearchTerm(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 207}}
                )
              )
            )
            , React.createElement('div', { className: "templates-list flex-grow  pt-0 flex flex-col gap-3 overflow-y-auto"       , __self: this, __source: {fileName: _jsxFileName, lineNumber: 216}}
              , filteredTemplates.length > 0 ? (
                filteredTemplates.map((template) => (
                  React.createElement('div', {
                    key: template.id,
                    className: "template-card bg-[#1a1a1a] border border-[#333] rounded-lg p-3.5 cursor-pointer transition-all flex items-center gap-3 hover:border-[#00ff88] hover:bg-[rgba(0,255,136,0.05)]"            ,
                    onClick: () => handleApplyTemplate(template.prompt), __self: this, __source: {fileName: _jsxFileName, lineNumber: 219}}

                    , React.createElement('div', { className: "template-icon w-8 h-8 min-w-[32px] bg-[rgba(0,255,136,0.1)] rounded-md flex items-center justify-center"        , __self: this, __source: {fileName: _jsxFileName, lineNumber: 224}}
                      , React.createElement('svg', {
                        viewBox: "0 0 24 24"   ,
                        className: "w-4 h-4 fill-[#00ff88]"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 225}}

                        , React.createElement('path', { d: "M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"             , __self: this, __source: {fileName: _jsxFileName, lineNumber: 229}} )
                      )
                    )
                    , React.createElement('div', { className: "template-info flex-1" , __self: this, __source: {fileName: _jsxFileName, lineNumber: 232}}
                      , React.createElement('div', { className: "template-name text-sm font-semibold text-white"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 233}}
                        , template.name
                      )
                      , React.createElement('div', { className: "template-desc text-xs text-[#999] leading-snug"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 236}}
                        , template.description
                      )
                    )
                  )
                ))
              ) : (
                React.createElement('p', { className: "text-center text-[#666] text-sm py-4"   , __self: this, __source: {fileName: _jsxFileName, lineNumber: 243}}, "No templates found."

                )
              )
            )
            , React.createElement('div', { className: "custom-prompt flex-shrink-0 pt-0"  , __self: this, __source: {fileName: _jsxFileName, lineNumber: 248}}
              , React.createElement('div', { className: "bg-[#1a1a1a] border border-[#333] rounded-lg p-4"    , __self: this, __source: {fileName: _jsxFileName, lineNumber: 249}}
                , React.createElement('h4', { className: "text-xs font-semibold text-[#00ff88] uppercase tracking-wider mb-3"     , __self: this, __source: {fileName: _jsxFileName, lineNumber: 250}}, "Custom Instructions" )
                , React.createElement('textarea', {
                  className: "w-full h-24 bg-[#252525] border border-[#333] rounded-md text-[#ccc] text-sm p-2.5 resize-none mb-3"          ,
                  placeholder: "e.g., Add headers, Convert to table..."     ,
                  value: prompt,
                  onChange: (e) => setPrompt(e.target.value), __self: this, __source: {fileName: _jsxFileName, lineNumber: 251}}
)
                , React.createElement('button', {
                  className: "w-full p-2.5 bg-[#00ff88] text-black border-none rounded-md text-sm font-semibold cursor-pointer transition-all hover:bg-[#00dd77]"          ,
                  onClick: handleFormat, __self: this, __source: {fileName: _jsxFileName, lineNumber: 257}}
, "Apply Format"

                )
              )
            )
          )
        )
      )
    )
  );
};

export default LeftSidebar;