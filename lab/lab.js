document.addEventListener('DOMContentLoaded', function () {
  var form = document.getElementById('answer-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var raw = (document.getElementById('answer-input').value || '');
    var answer = raw
      .toLowerCase()
      .trim()
      .replace(/[àáâãäå]/g, 'a')
      .replace(/[èéêë]/g, 'e')
      .replace(/[ìíîï]/g, 'i')
      .replace(/[òóôõö]/g, 'o')
      .replace(/[ùúûü]/g, 'u')
      .replace(/[ç]/g, 'c')
      .replace(/\s+/g, '')
      .replace(/-/g, '');
    if (answer) {
      window.location.href = answer + '.html';
    }
  });
});
