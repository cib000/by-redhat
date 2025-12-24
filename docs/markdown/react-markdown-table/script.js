function NewApp() {
  const orderedList = `
  1. List Item 1 
  2. List Item 2 
  3. List Item 3
  `;

  const unOrderedList1 = `
  * List Item 1 
  * List Item 2 
  * List Item 3
  `;

  const unOrderedList2 = `
  - List Item 1 
  - List Item 2 
  - List Item 3
  `;

  const nestedList = `
  1. OL item 1
     * UL item 1.1
     * UL item 1.2
     * UL item 1.3
  2. OL item 2
     * UL item 2.1
     * UL item 2.2
     * UL item 2.3
  `;

  const codeBlock = `${"```"}
  function myCode(){
      var a = 5;
  }
  ${"```"}`;

  const blockQuote = `
  > Blockquote
  `;


  return /*#__PURE__*/(
    React.createElement("div", { className: "App" }, /*#__PURE__*/
    React.createElement("h3", null, "React-Markdown - Without using any plugin"), /*#__PURE__*/

    React.createElement("table", { style: { width: "100%", borderCollapse: "collapse" } }, /*#__PURE__*/
    React.createElement("thead", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("th", null, "Element"), /*#__PURE__*/
    React.createElement("th", null, "Markdown Syntax"), /*#__PURE__*/
    React.createElement("th", null, "Rendered by React-Markdown"))), /*#__PURE__*/


    React.createElement("tbody", null, /*#__PURE__*/
    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 1 "), /*#__PURE__*/
    React.createElement("td", null, "# Heading 1"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "# Heading 1"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 2 "), /*#__PURE__*/
    React.createElement("td", null, "## Heading 2"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "## Heading 2"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 3 "), /*#__PURE__*/
    React.createElement("td", null, "### Heading 3"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "### Heading 3"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 4 "), /*#__PURE__*/
    React.createElement("td", null, "#### Heading 4"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "#### Heading 4"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 5 "), /*#__PURE__*/
    React.createElement("td", null, "##### Heading 5"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "##### Heading 5"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Heading 6 "), /*#__PURE__*/
    React.createElement("td", null, "###### Heading 6"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "###### Heading 6"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Bold "), /*#__PURE__*/
    React.createElement("td", null, "**Bold**"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "**Bold**"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Italics"), /*#__PURE__*/
    React.createElement("td", null, "*Italics*"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "*Italics*"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Ordered List"), /*#__PURE__*/
    React.createElement("td", null, "1. List Item 1", /*#__PURE__*/
    React.createElement("br", null), "2. List Item 2", /*#__PURE__*/
    React.createElement("br", null), "3. List Item 3"), /*#__PURE__*/


    React.createElement("td", { style: { textAlign: "left" } }, /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: orderedList }))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Unordered List"), /*#__PURE__*/
    React.createElement("td", null, "(Using *)", /*#__PURE__*/

    React.createElement("br", null), /*#__PURE__*/
    React.createElement("br", null), "* List Item 1", /*#__PURE__*/
    React.createElement("br", null), "* List Item 2", /*#__PURE__*/
    React.createElement("br", null), "* List Item 3", /*#__PURE__*/
    React.createElement("br", null), /*#__PURE__*/
    React.createElement("br", null), "(Using -)", /*#__PURE__*/

    React.createElement("br", null), /*#__PURE__*/
    React.createElement("br", null), "- List Item 1", /*#__PURE__*/
    React.createElement("br", null), "- List Item 2", /*#__PURE__*/
    React.createElement("br", null), "- List Item 3", /*#__PURE__*/
    React.createElement("br", null)), /*#__PURE__*/

    React.createElement("td", { style: { textAlign: "left" } },
    "(Using *)", /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: unOrderedList1 }),
    "(Using -)", /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: unOrderedList2 }))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Nested List ", /*#__PURE__*/
    React.createElement("br", null), " (Use 3 space indentation in children lists)"), /*#__PURE__*/

    React.createElement("td", { style: { textAlign: "left" } }, "1. OL item 1", /*#__PURE__*/
    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 1.1", /*#__PURE__*/

    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 1.2", /*#__PURE__*/

    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 1.3", /*#__PURE__*/

    React.createElement("br", null), "2. OL item 2", /*#__PURE__*/
    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 2.1", /*#__PURE__*/

    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 2.2", /*#__PURE__*/

    React.createElement("br", null), "\xA0\xA0\xA0* UL Item 2.3", /*#__PURE__*/

    React.createElement("br", null)), /*#__PURE__*/

    React.createElement("td", { style: { textAlign: "left" } }, /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: nestedList }))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Inline Code"), /*#__PURE__*/
    React.createElement("td", null, "`Code`"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "`Code`"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Code Block"), /*#__PURE__*/
    React.createElement("td", { style: { textAlign: "left" } }, "```", /*#__PURE__*/

    React.createElement("br", null),
    "function myCode(){", " ", /*#__PURE__*/React.createElement("br", null), "\xA0\xA0\xA0\xA0",
    "var a = 5;", " ", /*#__PURE__*/React.createElement("br", null),
    "}", " ", /*#__PURE__*/React.createElement("br", null), "```"), /*#__PURE__*/


    React.createElement("td", { style: { textAlign: "left" } }, /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: codeBlock }))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Horizontal Rule"), /*#__PURE__*/
    React.createElement("td", null, "---"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "---"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Blockquote"), /*#__PURE__*/
    React.createElement("td", { style: { textAlign: "left" } }, "> Blockquote"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, { children: blockQuote }))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Link"), /*#__PURE__*/
    React.createElement("td", { style: { textAlign: "left" } }, "[title](https://example.com)"), /*#__PURE__*/
    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "[title](https://example.com)"))), /*#__PURE__*/


    React.createElement("tr", null, /*#__PURE__*/
    React.createElement("td", null, "Image"), /*#__PURE__*/
    React.createElement("td", { style: { textAlign: "left" } }, "![alt_text](https://example.com/image.jpg)"), /*#__PURE__*/


    React.createElement("td", null, /*#__PURE__*/
    React.createElement(ReactMarkdown, null, "![title](https://upload.wikimedia.org/wikipedia/commons/6/62/INSTEAD-Logo-small.png)")))))));








}

const rootElement = document.getElementById("root");
ReactDOM.render( /*#__PURE__*/React.createElement(NewApp, null), rootElement);