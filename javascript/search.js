const municipalitiesPath = "https://raw.githubusercontent.com/moegi4gy/hoppo/refs/heads/main/json/municipalities.json";
let municipalities = [];

function getSearchElements() {
  return {
    searchBox: document.getElementById("search-box"),
    searchList: document.getElementById("search-list")
  };
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFKC");
}

function filterMunicipalities(keyword, { includeAll = false } = {}) {
  const query = normalizeText(keyword).trim();

  if (!query) {
    return includeAll ? municipalities : [];
  }

  return municipalities.filter((item) => {
    const searchableText = [
      item.name,
      item.name_en,
      item.name_kana,
      item.prefecture,
      item.branch,
      item.county
    ]
      .join(" ")
      .toLowerCase();

    return normalizeText(searchableText).includes(query);
  });
}

function renderResults(items, searchList, { showEmpty = false } = {}) {
  if (!searchList) {
    return;
  }

  searchList.innerHTML = "";

  if (!items.length) {
    if (!showEmpty) {
      return;
    }

    const emptyItem = document.createElement("li");
    emptyItem.className = "search-empty";
    emptyItem.textContent = "該当する市町村はありません。";
    searchList.appendChild(emptyItem);
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.className = "search-item";

    const name = document.createElement("strong");
    name.textContent = item.name;

    const meta = document.createElement("span");
    meta.textContent = [item.prefecture, item.branch, item.county]
      .filter(Boolean)
      .join(" / ");

    listItem.appendChild(name);
    listItem.appendChild(meta);
    fragment.appendChild(listItem);
  });

  searchList.appendChild(fragment);
}

async function loadMunicipalities() {
  const { searchBox, searchList } = getSearchElements();

  try {
    const response = await fetch(municipalitiesPath);

    if (!response.ok) {
      throw new Error("JSON の読み込みに失敗しました。");
    }

    const data = await response.json();
    municipalities = data.municipalities || [];
    renderResults(filterMunicipalities(searchBox ? searchBox.value : "", { includeAll: false }), searchList, { showEmpty: false });
  } catch (error) {
    if (searchList) {
      searchList.innerHTML = "";
      const errorItem = document.createElement("li");
      errorItem.className = "search-empty";
      errorItem.textContent = error.message;
      searchList.appendChild(errorItem);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const { searchBox, searchList } = getSearchElements();

  if (!searchBox || !searchList) {
    return;
  }

  searchBox.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      renderResults(filterMunicipalities(searchBox.value, { includeAll: true }), searchList, { showEmpty: true });
    }
  });

  searchList.innerHTML = "";
  loadMunicipalities();
});