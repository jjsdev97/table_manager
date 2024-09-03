import * as Constant from "./constant/tableConstant.js";
import * as Object from "./util/objectUtil.js";

class TableManager {
  #attributes;
  #attributesKor;
  #tableContainer;
  #table;
  #originDataSet;
  #usingDataSet;
  #listSize;
  #pagingSize;
  #page = 1;
  #pager;
  #searchKey;
  #searchWord;
  #sortAttribute;
  #sortOption;
  #topMenus = [Constant.TOP_MENU_LISTSIZE, Constant.TOP_MENU_SEARCH];
  #listSizeOption = [10, 25, 50, 100, 150];
  #objectAttribute = new Array();
  #objectAttributeTitle = new Array();

  constructor(divID) {
    this.#tableContainer = document.getElementById(divID);
  }

  set attributes(attributes) {
    this.#attributes = attributes;
  }

  set attributesKor(attributesKor) {
    this.#attributesKor = attributesKor;
  }
  set dataSet(dataSet) {
    this.#originDataSet = dataSet;
    this.duplicateDataSet();
  }

  set listSize(listSize) {
    this.#listSize = listSize;
  }

  set pagingSize(pagingSize) {
    this.#pagingSize = pagingSize;
  }

  set topMenus(topMenus) {
    this.#topMenus = topMenus;
  }

  set listSizeOption(listSizeOption) {
    this.#listSizeOption = listSizeOption;
  }

  setObjectAttribute(targetAttribute, targetTitle) {
    this.#objectAttribute.push(targetAttribute);
    this.#objectAttributeTitle.push(targetTitle);
  }

  get table() {
    return this.#table;
  }

  duplicateDataSet() {
    this.#usingDataSet = JSON.parse(JSON.stringify(this.#originDataSet));
  }

  make() {
    this.createTableElement();
    this.appendTopMenu();
    this.appendTableHead();
    this.appendTableBody();
    this.changePagingUI();
    this.changeFields();
  }

  setSortParameter(sortAttribute, sortOption) {
    this.#sortAttribute = sortAttribute;
    this.#sortOption = sortOption;
  }

  setSearchKeyword(searchKey, searchWord) {
    this.#searchKey = searchKey;
    this.#searchWord = searchWord;
  }

  appendTopMenu() {
    const topMenuContainer = document.createElement("div");
    topMenuContainer.style.display = "flex";

    this.#topMenus.forEach((menu) => {
      const topMenu = this.createTopMenu(menu);
      topMenuContainer.append(topMenu);
    });

    this.#tableContainer.prepend(topMenuContainer);
  }

  createTopMenu(menu) {
    switch (menu) {
      case Constant.TOP_MENU_LISTSIZE:
        return this.createTopMenuListSize();
        break;
      case Constant.TOP_MENU_SEARCH:
        return this.createTopMenuSearchBar();
        break;
    }
  }

  createTopMenuListSize() {
    const topMenuListSize = document.createElement("div");
    const topMenuListSizeSelect = document.createElement("select");

    this.#listSizeOption.forEach((option) => {
      const selectOption = document.createElement("option");
      selectOption.value = option;
      selectOption.innerHTML = option;
      if (option == this.#listSize) selectOption.selected = true;

      topMenuListSizeSelect.append(selectOption);
    });

    topMenuListSizeSelect.addEventListener("change", (e) => {
      this.changeListSize(e.target.value);
    });

    return topMenuListSizeSelect;
  }

  createTopMenuSearchBar() {
    const topMenuSearchBar = document.createElement("div");
    const searchKeySelect = document.createElement("select");
    this.#attributes.forEach((attribute) => {
      const searchKeyOption = document.createElement("option");
      searchKeyOption.value = attribute;
      searchKeyOption.innerHTML = attribute;
      if (attribute === this.#searchKey) searchKeyOption.selected = true;

      searchKeySelect.append(searchKeyOption);
    });
    const searchInput = document.createElement("input");
    searchInput.value = this.#searchWord ?? "";

    const searchButton = document.createElement("button");
    searchButton.innerHTML = "검색";

    searchButton.addEventListener("click", (e) => {
      this.setSearchKeyword(searchKeySelect.value, searchInput.value);
      this.filterData();
      this.clear();
      this.make();
    });

    topMenuSearchBar.append(searchKeySelect);
    topMenuSearchBar.append(searchInput);
    topMenuSearchBar.append(searchButton);

    return topMenuSearchBar;
  }

  appendTableHead() {
    const tableHead = document.createElement("thead");
    const tableHeadRow = document.createElement("tr");

    this.#attributes.forEach((attribute, index) => {
      const tableAttr = document.createElement("th");

      const sortButton = document.createElement("button");
      sortButton.innerHTML = "sort";
      sortButton.dataset.attribute = attribute;

      sortButton.dataset.option =
        this.#sortAttribute == attribute &&
        this.#sortOption == Constant.SORT_ASCENDING
          ? Constant.SORT_DESCENDING
          : Constant.SORT_ASCENDING;
      sortButton.addEventListener("click", (e) => {
        this.setSortParameter(
          e.target.dataset.attribute,
          e.target.dataset.option
        );
        this.sortData();
        this.clear();
        this.make();
      });

      tableAttr.innerHTML = this.#attributesKor[index] ?? attribute;
      tableAttr.append(sortButton);

      tableHeadRow.append(tableAttr);
    });
    tableHead.append(tableHeadRow);

    this.#table.append(tableHead);
  }

  appendTableBody() {
    const tableBody = document.createElement("tbody");

    for (let i = 0; i < this.#listSize; i++) {
      const tableDataRow = document.createElement("tr");

      this.#attributes.forEach((attribute) => {
        const tableData = document.createElement("td");
        tableData.innerHTML = "&nbsp;";
        tableDataRow.append(tableData);
      });

      tableBody.append(tableDataRow);
    }

    this.#table.append(tableBody);
  }

  createTableElement() {
    this.#table = document.createElement("table");
    this.#table.classList.add("table");
    this.#table.classList.add("table-striped");
    this.#tableContainer.append(this.#table);
  }

  paging(page) {
    if (isNaN(page)) {
      switch (page) {
        case Constant.PAGING_START:
          page = 1;
          break;
        case Constant.PAGING_LEFT:
          page = this.#page - 1;
          break;
        case Constant.PAGING_RIGHT:
          page = this.#page + 1;
          break;
        case Constant.PAGING_END:
          page = this.getLastPage();
          break;
      }

      page =
        page > this.getLastPage() ? page - 1 : page == 0 ? (page = 1) : page;
    }

    this.#page = page;
    this.changePagingUI();
    this.changeFields();
  }

  clear() {
    this.#page = 1;
    this.#tableContainer.innerHTML = "";
  }

  changeFields() {
    const tableBody = this.#table.children[1];

    for (let rowIndex = 0; rowIndex < this.#listSize; rowIndex++) {
      let tableRow = tableBody.children[rowIndex];

      this.#attributes.forEach((attribute, attrIndex) => {
        let tableData = tableRow.children[attrIndex];
        let data = this.getData(rowIndex, attribute);
        if (data instanceof HTMLDivElement) {
          tableData.innerHTML = '';
          tableData.append(data);
        } else {
          tableData.innerHTML = data;
        }
      });
    }
  }

  changePagingUI() {
    if (this.#pager) this.#pager.remove();
    this.#pager = document.createElement("div");

    const pagingButtons = new Array();
    pagingButtons.push(this.makePagingButton(Constant.PAGING_START));
    pagingButtons.push(this.makePagingButton(Constant.PAGING_LEFT));

    let pagingIndex = this.getPagingIndex();
    let firstPagingIndex = pagingIndex;
    for (
      pagingIndex;
      pagingIndex < firstPagingIndex + this.#pagingSize;
      pagingIndex++
    ) {
      if (pagingIndex > this.getLastPage()) break;
      const button = this.makePagingButton(pagingIndex);
      if (pagingIndex == this.#page) button.classList.add("on");
      pagingButtons.push(button);
    }
    pagingButtons.push(this.makePagingButton(Constant.PAGING_RIGHT));
    pagingButtons.push(this.makePagingButton(Constant.PAGING_END));

    pagingButtons.forEach((btn) => {
      this.#pager.append(btn);
    });

    this.#tableContainer.append(this.#pager);
  }

  changeListSize(listSize) {
    this.clear();
    this.listSize = listSize;
    this.make();
  }

  getPagingIndex() {
    let divide = Math.floor((this.#page - 1) / this.#pagingSize);
    return divide * this.#pagingSize + 1;
  }

  getData(rowIndex, attribute) {
    let dataIndex = rowIndex + (this.#page - 1) * this.#listSize;
    let data = this.#usingDataSet[dataIndex];

    if (
      Object.isObject(data[attribute]) &&
      this.#objectAttribute.indexOf(attribute) != -1
    ){
      const buttonContainer = this.makeObjectToNewView(data[attribute], attribute);
      return buttonContainer;
    }
      

    return data ? data[attribute] ?? "&nbsp;" : "&nbsp;";
  }

  makeObjectToNewView(object, attribute) {
    const buttonContainer = document.createElement("div");

    object.forEach((element) => {
      let button = this.createObjectAlertButton(element, attribute);

      buttonContainer.append(button);
    });

  
    return buttonContainer;
  }

  createObjectAlertButton(object, attribute) {
    const button = document.createElement("button");
    let title = "";
    this.#objectAttribute.forEach((item, index) => {
      if (attribute == item) title = object[this.#objectAttributeTitle[index]];
    });

    button.innerHTML = title;
    button.addEventListener("click", () => {
      alert(Object.objectToString(object));
    });
    return button;
  }

  sortData() {
    const targetAttribute = this.#sortAttribute;

    switch (this.#sortOption) {
      case Constant.SORT_ASCENDING:
        this.#usingDataSet.sort(compare);
        break;
      case Constant.SORT_DESCENDING:
        this.#usingDataSet.reverse(compare);
        break;
    }

    function compare(a, b) {
      let targetA = a[targetAttribute];
      let targetB = b[targetAttribute];
      targetA = Object.isObject(targetA)
        ? Object.objectToString(targetA)
        : targetA;
      targetB = Object.isObject(targetB)
        ? Object.objectToString(targetB)
        : targetB;

      if (targetA > targetB) return 1;
      if (targetA < targetB) return -1;
      return 0;
    }
  }

  filterData() {
    this.#usingDataSet = this.#originDataSet.filter(
      (data) => data[this.#searchKey].indexOf(this.#searchWord) != -1
    );
  }

  makePagingButton(input) {
    let pageStr = "";

    switch (input) {
      case Constant.PAGING_START:
        pageStr = "<<";
        break;
      case Constant.PAGING_LEFT:
        pageStr = "<";
        break;
      case Constant.PAGING_RIGHT:
        pageStr = ">";
        break;
      case Constant.PAGING_END:
        pageStr = ">>";
        break;
      default:
        pageStr = input;
    }

    const button = document.createElement("button");
    button.innerHTML = pageStr;
    button.addEventListener("click", () => {
      this.paging(input);
    });
    return button;
  }

  getLastPage() {
    return Math.floor(
      this.#usingDataSet.length / this.#listSize +
        (this.#usingDataSet.length % this.#listSize >= 1 ? 1 : 0)
    );
  }
}
export { TableManager };
