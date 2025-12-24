var MarkdownPreview = React.createClass({ displayName: "MarkdownPreview",
  getInitialState: function () {
    return {
      output: this.props.text };

  },
  handleChange: function (e) {
    this.setState({
      output: e.target.value });

  },
  clearInput: function () {
    this.setState({
      output: '' });

  },
  render: function () {
    return /*#__PURE__*/(
      React.createElement("div", { className: "wrapper" }, /*#__PURE__*/
      React.createElement("form", { className: "input" }, /*#__PURE__*/
      React.createElement("h3", null, "Enter markdown below ", /*#__PURE__*/React.createElement("span", { className: "clearBtn", onClick: this.clearInput }, "Clear")), /*#__PURE__*/
      React.createElement("textarea", { rows: "50", cols: "50", placeholder: "Enter your markdown", value: this.state.output, onChange: this.handleChange })), /*#__PURE__*/

      React.createElement(DisplayOutput, { input: this.state.output })));


  } });


var DisplayOutput = React.createClass({ displayName: "DisplayOutput",
  rawMarkup: function () {
    var rawMarkup = marked(this.props.input.toString(), { sanitize: true });
    return { __html: rawMarkup };
  },
  render: function () {
    return /*#__PURE__*/(
      React.createElement("div", { className: "output" }, /*#__PURE__*/
      React.createElement("h3", null, "Output"), /*#__PURE__*/
      React.createElement("div", { className: "outputText" }, /*#__PURE__*/React.createElement("span", { dangerouslySetInnerHTML: this.rawMarkup() }))));


  } });


var previewText = 'Markdown Quick Start\
                  \r\r # A large heading \r ## Next largest \r ###### Smallest \
                  \r\r **This is bold text**  \r __So is this__  \
                  \r\r *This text is italicized*  \r _So is this_  \
                  \r\r ~~This was mistaken text~~  \
                  \r\r To quote use  \r > to denote the quoted text  \
                  \r\r Use `backticks` for codes or commands  \
                  \r Use \r ``` \r triple backticks \r for multiple lines \r of code \r ```  \
                  \r\r Create inline links like so  \
                  \r This app was built using [React](https://facebook.github.io/react/index.html)  \
                  \r\r Unordered lists\
                  \r\r * Fish  \r * Chips  \r * Peas\
                  \r\r Nested & ordered Lists\
                  \r\r1. Breakfast\r    - Toast\r    - Cereal  \r2. Dinner\r    * Fish & Chips\r      - Peas\r    * Pie & Chips';

React.render( /*#__PURE__*/
React.createElement(MarkdownPreview, { text: previewText }),
document.getElementById("marked"));