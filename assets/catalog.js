"use strict";

const themeButton = document.querySelector("[data-theme-control]");
const themes = ["system", "light", "dark"];
const themeLabels = {system: "시스템", light: "라이트", dark: "다크"};
let theme = "system";
try {
  const stored = localStorage.getItem("mywidget-ui-catalog-theme");
  if (themes.includes(stored)) theme = stored;
} catch {
  // Static previews still work when storage is unavailable.
}

function applyTheme() {
  if (theme === "system") delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = theme;
  themeButton.textContent = `문서 테마: ${themeLabels[theme]}`;
  themeButton.setAttribute(
    "aria-label",
    `문서 테마: ${themeLabels[theme]}. 선택하면 ${themeLabels[themes[(themes.indexOf(theme) + 1) % themes.length]]} 테마로 변경합니다.`,
  );
}

themeButton.hidden = false;
themeButton.addEventListener("click", () => {
  theme = themes[(themes.indexOf(theme) + 1) % themes.length];
  try {
    localStorage.setItem("mywidget-ui-catalog-theme", theme);
  } catch {
    // The current page can still change theme.
  }
  applyTheme();
});
applyTheme();

for (const collection of document.querySelectorAll("[data-collection]")) {
  const filters = collection.querySelector("[data-filters]");
  const items = [...collection.querySelectorAll("[data-entry]")];
  const count = collection.querySelector("[data-count]");
  const search = filters.querySelector("[data-search]");
  const choices = [...filters.querySelectorAll("select[data-filter]")];

  function filterEntries() {
    const terms = search?.value.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean) ?? [];
    let visible = 0;
    for (const item of items) {
      const searchable = item.dataset.searchable?.toLocaleLowerCase() ?? "";
      const matchesText = terms.every(term => searchable.includes(term));
      const matchesFilters = choices.every(choice => {
        const values = (item.dataset[choice.dataset.filter] ?? "").split("|");
        return !choice.value || values.includes(choice.value);
      });
      item.hidden = !(matchesText && matchesFilters);
      if (!item.hidden) visible += 1;
    }
    count.textContent = visible ? `${items.length}개 중 ${visible}개 표시` : "조건과 일치하는 항목이 없습니다.";
  }

  filters.hidden = false;
  filters.addEventListener("input", filterEntries);
  filterEntries();
}
