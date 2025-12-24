class CloudMarked {
  constructor() {
    this.state = {
      editor: document.getElementById('markdown'),
      renderer: document.getElementById('output') };

    this.controls = {
      undo: document.getElementById('undo'),
      redo: document.getElementById('redo'),
      h1: document.getElementById('h1'),
      h2: document.getElementById('h2'),
      h3: document.getElementById('h3'),
      h4: document.getElementById('h4'),
      h5: document.getElementById('h5'),
      h6: document.getElementById('h6'),
      bold: document.getElementById('bold'),
      italic: document.getElementById('italic'),
      strike: document.getElementById('strike'),
      // emp: 	document.getElementById('emp'),
      bq: document.getElementById('bq'),
      hr: document.getElementById('hr'),
      ul: document.getElementById('bullets'),
      ol: document.getElementById('numbers'),
      code: document.getElementById('code'),
      codeblock: document.getElementById('codeblock') };

    this.init(this.state);
    this.inputChange(this.state);
    this.pointerScope(this.state);
  }

  init(state) {

    const editor = this.editor = CodeMirror.fromTextArea(state.editor, {
      lineNumbers: true,
      matchBrackets: true,
      mode: 'text/x-markdown',
      theme: 'material-dark',
      cursorHeight: .85,
      lineWrapping: true });


    this.render(state);
    this.formatControl(this.controls);
  }

  render(state) {
    let { editor, renderer } = this.state;
    let preview = renderer.innerHTML;
    renderer.innerHTML = marked(editor.value);
    hljs.initHighlightingOnLoad();
  }

  inputChange() {
    const mirror = this;
    mirror.editor.on('change', e => {
      mirror.editor.save();
      mirror.state.renderer.innerHTML = marked(e.getValue());
    });
  }

  pointerScope(state) {
    let { editor, renderer } = this.state;
    renderer.addEventListener('scroll', function (e) {
      console.log(e.target.scrollTop);
    });
  }

  formatControl(controls) {
    for (let key in controls) {
      controls[key].addEventListener('click', e => this.handleControlClick(e));
    }
  }

  handleControlClick(e) {
    const editor = this.editor;
    let cursor = editor.getCursor();
    let selectedtext = editor.somethingSelected() === true ? editor.getSelection() : '';
    let command = selectedtext !== '' ? 'replaceSelection' : 'replaceRange';

    switch (e.target.id) {
      case 'undo':
        editor.undo();
        break;
      case 'redo':
        editor.redo();
        break;
      case 'h1':
        editor[command](`  \n# ${selectedtext} `, cursor);
        break;
      case 'h2':
        editor.replaceRangeeditor[command];
        break;
      case 'h3':
        editor[command]('  \n###  ', cursor);
        break;
      case 'h4':
        editor[command]('  \n####  ', cursor);
        break;
      case 'h5':
        editor[command]('  \n#####  ', cursor);
        break;
      case 'h6':
        editor[command]('  \n######  ', cursor);
        break;
      case 'bold':
        editor[command]('  \n**Bold**  ', cursor);
        break;
      case 'italic':
        editor[command]('  \n*Italic*  ', cursor);
        break;
      case 'strike':
        editor[command]('  \n~~Strike~~  ', cursor);
        break;
      case 'bq':
        editor[command]('  \n> Blockquote  \n  ', cursor);
        break;
      case 'hr':
        editor[command]('\n  \n----  \n', cursor);
        break;
      case 'bullets':
        editor[command]('  \n- List  ', cursor);
        break;
      case 'numbers':
        editor[command]('  \n1. Numbered List  ', cursor);
        break;
      case 'code':
        editor[command]('  \n `inline code` ', cursor);
        break;
      case 'codeblock':
        editor[command]('  \n```\n function() { \n newCode()\n }``` ', cursor);
        break;}

    editor.focus();
    hljs.initHighlighting();
  }}


new CloudMarked();