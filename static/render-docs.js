// /static/render-docs.js
// 업무 백과사전 렌더러 (신 JSON 스펙 대응)

(async function () {
  const sidebar = document.getElementById("docsSidebar");
  const content = document.getElementById("docsContent");
  if (!sidebar || !content) return;

  const res = await fetch("/data/docs-portal.json", { cache: "no-store" });
  const data = await res.json();

  // 사이드바 렌더
  sidebar.innerHTML = data.groups.map(group => `
    <div class="docs-group">
      <div class="docs-group-title">${escapeHtml(group.title)}</div>
      ${group.docs.map(doc => `
        <a href="#${doc.id}" data-doc-id="${doc.id}">
          ${escapeHtml(doc.title)}
        </a>
      `).join("")}
    </div>
  `).join("");

  // 본문 렌더 함수
  function renderDoc(docId) {
    const doc = data.groups.flatMap(g => g.docs).find(d => d.id === docId);
    if (!doc) {
      content.innerHTML = `<p class="muted">문서를 찾을 수 없습니다.</p>`;
      return;
    }

    content.innerHTML = `
      <article>
        <h1 class="page-title">${escapeHtml(doc.title)}</h1>
        ${(doc.blocks ?? []).map(renderBlock).join("")}
      </article>
    `;
  }

  // 클릭 이벤트
  sidebar.addEventListener("click", (e) => {
    const link = e.target.closest("[data-doc-id]");
    if (!link) return;

    e.preventDefault();
    const id = link.getAttribute("data-doc-id");
    location.hash = id;
    renderDoc(id);
  });

  // 초기 진입
  const initialId = (location.hash || "").replace("#", "");
  if (initialId) renderDoc(initialId);

  /* =========================
     블록 렌더
     ========================= */
  function renderBlock(b) {
    if (b.type === "p") return `<p>${escapeHtml(b.text)}</p>`;
    if (b.type === "ul") return `<ul>${b.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
    if (b.type === "ol") return `<ol>${b.items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ol>`;
    if (b.type === "h3") return `<h3>${escapeHtml(b.text)}</h3>`;
    return "";
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
