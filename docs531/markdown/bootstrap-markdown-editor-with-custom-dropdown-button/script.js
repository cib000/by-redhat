jQuery(document).ready(function($) {
  $('#content').markdown({
    // Callback for the 'onShow' event.
    //   Here we will transform the custom button into a dropdown button.
    onShow: function(e) {
      // Get the custom button named "cmdBeer".
      var $button = e.$textarea.closest('.md-editor').find('button[data-handler="bootstrap-markdown-cmdBeer"]');
      
      // Transform the button into a bootstrap dropdown menu button.
      // The list of options would be set as html code in the .after() method.
      $button.attr('data-toggle', 'dropdown')
        .css({
          'float': 'none'
        })
        .wrap('<div class="dropdown"></div>')
        .after('<ul class="dropdown-menu"><li><a data-cmd="item1">Item 1</a></li><li><a data-cmd="item2">Item 2</a></li></ul>');

      // Add the click handler for the options. In this example we just write
      // the cmd into the content.
      $button.closest('.dropdown').find('.dropdown-menu').on('click', 'a[data-cmd]', function() {
        e.replaceSelection('CLICKED: ' + $(this).data('cmd') + '\n');
      });

      // Inform bootstrap about the dropdown button.
      $button.dropdown();
    },
    additionalButtons: [
      [{
        data: [{
          name: 'cmdBeer',
          title: 'Beer',
          icon: {
            'glyph': 'glyphicon glyphicon-star',
            'fa': 'fa fa-star',
            'fa-3': 'icon-star',
            'octicons': 'octicon octicon-star'
          }
        }]
      }]
    ]
  });
});