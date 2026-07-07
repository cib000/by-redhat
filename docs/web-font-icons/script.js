$('.iconfont').each(function () {
  const $box = $(this);
  const $icon = $('<i class="ph ph-copy copy-code"></i>').appendTo($box.find('.iconfont01'));
  const $code = $box.find('textarea');

  $icon.on('click', function () {
    const el = $code[0];

    const range = document.createRange();
    range.selectNodeContents(el);

    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    navigator.clipboard.writeText($code.text());

    $icon.removeClass('ph ph-copy').addClass('ph ph-thumbs-up');

    setTimeout(() => {
      $icon.removeClass('ph ph-thumbs-up').addClass('ph ph-copy');
      sel.removeAllRanges();
    }, 1500);
  });
});