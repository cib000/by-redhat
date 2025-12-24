Handlebars.registerHelper("mdToHtml", function(md, options) {
  return new Handlebars.SafeString(marked(md));
});

Handlebars.registerPartial("side-by-side", $("#side-by-side-partial").html());

var mdPage = $("#sample-markdown").html();
var template = Handlebars.compile(mdPage);
var pureMd = template();
$("#output").html(marked(pureMd));