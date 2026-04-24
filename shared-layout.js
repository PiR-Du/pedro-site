async function injectPartial(targetId, partialPath, transform) {
  const target = document.getElementById(targetId);
  if (!target) return;

  const response = await fetch(partialPath);
  if (!response.ok) throw new Error(`Unable to load partial: ${partialPath}`);

  const html = await response.text();
  target.outerHTML = transform ? transform(html) : html;
}

document.addEventListener("DOMContentLoaded", async () => {
  const root = (document.body.dataset.root || ".").replace(/\/$/, "");
  const page = document.body.dataset.page || "";
  const partialBase = root === "." ? "./partials" : `${root}/partials`;

  try {
    await injectPartial("site-header", `${partialBase}/header.html`, html =>
      html.replaceAll("{{root}}", root)
    );
    await injectPartial("site-footer", `${partialBase}/footer.html`);

    document
      .querySelectorAll(`[data-nav-link="${page}"]`)
      .forEach(link => link.classList.add("active"));
  } catch (error) {
    console.error(error);
  }
});
