var vm = new Vue({
  el: '#root',
  data: {
    mdRaw: '',
    mdRawRender: ''
  },
  watch: {
    mdRaw: function(){
      this.mdRender()
    }
  },
  created() {
    this.mdRaw = `# H1
## H2
### H3
#### H4
##### H5
###### H6

Emphasis, aka italics, with *asterisks* or _underscores_.

Strong emphasis, aka bold, with **asterisks** or __underscores__.

Combined emphasis with **asterisks and _underscores_**.

Strikethrough uses two tildes. ~~Scratch this.~~

Colons can be used to align columns.

| Tables        | Are           | Cool  |
| ------------- |:-------------:| -----:|
| col 3 is      | right-aligned | $1600 |
| col 2 is      | centered      |   $12 |
| zebra stripes | are neat      |    $1 |

There must be at least 3 dashes separating each header cell.
The outer pipes (|) are optional, and you don't need to make the 
raw Markdown line up prettily. You can also use inline Markdown.

Markdown | Less | Pretty
--- | --- | ---
*Still* | renders | **nicely**
1 | 2 | 3
`
  },
  methods: {
    mdRender: function() {
      this.mdRawRender = marked(this.mdRaw);
    }
  }
})