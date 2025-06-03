// ==UserScript==
// @name         智能表单填充
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  自动填充Element UI和Ant Design表单组件
// @author       twelve
// @match        *://*/*
// @grant        GM_addStyle
// @downloadURL  https://github.com/twelve-web/auto-form/master/auto-form.user.js
// @updateURL    https://github.com/twelve-web/auto-form/master/auto-form.user.js
// ==/UserScript==

(function () {
  "use strict";

  // 样式
  GM_addStyle(`
          .auto-form-panel {
              position: fixed;
              right: 20px;
              top: 20px;
              z-index: 9999;
              display: flex;
              flex-direction: column;
              gap: 10px;
              background: linear-gradient(135deg, rgba(32, 39, 56, 0.9) 0%, rgba(48, 61, 94, 0.9) 100%);
              border-radius: 12px;
              padding: 15px;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
              backdrop-filter: blur(8px);
              border: 1px solid rgba(255, 255, 255, 0.1);
              color: #fff;
              font-family: 'Arial', sans-serif;
              transition: all 0.3s ease;
          }
          
          .auto-form-title {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              text-align: center;
              color: #fff;
          }
          
          .auto-form-button {
              background: linear-gradient(90deg, #3c6ff3 0%, #5e85ff 100%);
              border: none;
              border-radius: 8px;
              color: white;
              padding: 10px 20px;
              cursor: pointer;
              font-weight: bold;
              transition: all 0.2s;
              font-size: 14px;
          }
          
          .auto-form-button:hover {
              transform: translateY(-2px);
          }
          
          .auto-form-close {
              background: linear-gradient(90deg, #f45b69 0%, #ff7a85 100%);
          }
          
          .auto-form-status {
              font-size: 12px;
              margin-top: 10px;
              color: #a0e4ff;
              text-align: center;
          }
      `);

  // 创建UI面板
  function createUI() {
    const panel = document.createElement("div");
    panel.className = "auto-form-panel";
    panel.id = "auto-form-panel";

    const title = document.createElement("div");
    title.className = "auto-form-title";
    title.textContent = "智能表单填充";

    const fillButton = document.createElement("button");
    fillButton.className = "auto-form-button";
    fillButton.textContent = "开始填充";
    fillButton.onclick = startFilling;

    const closeButton = document.createElement("button");
    closeButton.className = "auto-form-button auto-form-close";
    closeButton.textContent = "关闭";
    closeButton.onclick = removeUI;

    const status = document.createElement("div");
    status.className = "auto-form-status";
    status.id = "auto-form-status";
    status.textContent = "准备就绪";

    panel.appendChild(title);
    panel.appendChild(fillButton);
    panel.appendChild(closeButton);
    panel.appendChild(status);

    document.body.appendChild(panel);
  }

  // 移除UI
  function removeUI() {
    const panel = document.getElementById("auto-form-panel");
    if (panel) {
      panel.remove();
    }
  }

  // 更新状态
  function updateStatus(message) {
    const status = document.getElementById("auto-form-status");
    if (status) {
      status.textContent = message;
    }
  }

  // 生成随机文本
  function generateRandomText(minLength = 10) {
    const phrases = [
      "这是一个测试文本内容",
      "自动填充的示例数据",
      "Element UI表单测试",
      "随机生成的内容信息",
      "表单自动化填充工具",
    ];

    let result = "";
    while (result.length < minLength) {
      result += phrases[Math.floor(Math.random() * phrases.length)] + " ";
    }

    return result.trim();
  }

  // 根据标签内容智能生成数据
  function generateDataByLabel(labelText) {
    const label = labelText.toLowerCase().trim();

    // 默认返回通用文本
    return generateRandomText(10);
  }

  // 检查元素是否可见
  function isElementVisible(element) {
    if (!element) return false;
    const style = window.getComputedStyle(element);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      element.offsetWidth > 0 &&
      element.offsetHeight > 0
    );
  }

  // 检查元素是否已填充
  function isElementFilled(element) {
    return element.hasAttribute("data-auto-filled");
  }

  // 标记元素已填充
  function markElementFilled(element) {
    element.setAttribute("data-auto-filled", "true");
  }

  // 填充Element UI表单元素
  async function fillElementFormElement(element, labelText = "") {
    if (isElementFilled(element) || !isElementVisible(element)) {
      return;
    }

    try {
      const tagName = element.tagName.toLowerCase();
      let value = "";

      // 根据标签内容生成智能数据
      if (labelText) {
        value = generateDataByLabel(labelText);
      }

      if (tagName === "input") {
        console.log(element.type, "========");
        const type = (element.type || "text").toLowerCase();

        switch (type) {
          case "text":
          case "email":
          case "tel":
          case "password":
            element.value = labelText ? value : generateRandomText(10);
            break;
          case "number":
            console.log(type, "========");
            if (labelText && typeof value === "number") {
              element.value = value;
            } else if (
              labelText &&
              typeof value === "string" &&
              !isNaN(parseFloat(value))
            ) {
              element.value = parseFloat(value);
            } else {
              element.value = Math.floor(Math.random() * 100) + 1;
            }
            break;
        }

        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      } else if (tagName === "textarea") {
        element.value = labelText ? value : generateRandomText(30);
        element.dispatchEvent(new Event("input", { bubbles: true }));
        element.dispatchEvent(new Event("change", { bubbles: true }));
      }

      markElementFilled(element);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error("填充Element UI表单元素失败:", error);
    }
  }

  // 处理Element UI组件
  async function handleElementUIComponents() {
    updateStatus("正在处理 Element UI 组件...");

    // 处理 el-form-item 组件
    const elFormItems = document.querySelectorAll(
      ".el-form-item:not([data-auto-filled])"
    );
    for (const formItem of elFormItems) {
      if (!isElementVisible(formItem)) continue;

      try {
        // 获取标签文本
        const labelElement = formItem.querySelector(".el-form-item__label");
        const labelText = labelElement
          ? labelElement.textContent.trim().replace(":", "").replace("：", "")
          : "";

        console.log("处理表单项:", labelText);

        // 获取表单控件容器
        const contentElement = formItem.querySelector(".el-form-item__content");
        if (!contentElement) continue;

        // 处理各种 Element UI 控件
        // 1. 处理 el-input
        const elInput = contentElement.querySelector(`
          :scope > .el-input:not([data-auto-filled]):not(.el-date-editor),
          :scope > .el-autocomplete > .el-input:not([data-auto-filled])
        `);
        if (elInput) {
          const input = elInput.querySelector("input, textarea");
          if (input && !isElementFilled(input)) {
            // 只有type="text"的input才使用智能填写
            if (
              input.tagName.toLowerCase() === "input" &&
              input.type === "text"
            ) {
              await fillElementFormElement(input, labelText);
            } else {
              // 其他类型使用普通填写
              await fillElementFormElement(input);
            }
          }
          markElementFilled(elInput);
        }
        // 1.5. 处理 el-textarea
        const elTextarea = contentElement.querySelector(
          ":scope > .el-textarea:not([data-auto-filled])"
        );
        if (elTextarea) {
          const textarea = elTextarea.querySelector("textarea");
          if (textarea && !isElementFilled(textarea)) {
            // textarea 使用智能填写
            await fillElementFormElement(textarea, labelText);
          }
          markElementFilled(elTextarea);
        }
        // 2. 处理 el-select
        const elSelect = contentElement.querySelector(
          ":scope > .el-select:not([data-auto-filled]):not(.is-disabled)"
        );
        if (elSelect) {
          try {
            // 检查是否包含 el-select__tags（多选或可搜索选择器）
            const hasSelectTags = elSelect.querySelector(".el-select__tags");

            if (hasSelectTags) {
              // 处理带有 el-select__tags 的选择器
              const input = elSelect.querySelector("input");
              if (input) {
                // 聚焦输入框
                input.focus();
                await new Promise((resolve) => setTimeout(resolve, 100));

                // 输入一个字符
                input.value = "a";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                await new Promise((resolve) => setTimeout(resolve, 300));

                // 删除字符
                input.value = "";
                input.dispatchEvent(new Event("input", { bubbles: true }));
                await new Promise((resolve) => setTimeout(resolve, 300));
              }
            } else {
              // 处理普通选择器
              elSelect.click();
              await new Promise((resolve) => setTimeout(resolve, 300));
            }

            // 查找并点击选项
            const dropdownItems = document.querySelectorAll(
              ".el-select-dropdown__item:not(.is-disabled)"
            );
            const visibleItems = Array.from(dropdownItems).filter((item) =>
              isElementVisible(item)
            );

            if (visibleItems.length > 0) {
              const selectedIndex = Math.floor(
                Math.random() * visibleItems.length
              );
              visibleItems[selectedIndex].click();
              await new Promise((resolve) => setTimeout(resolve, 200));

              // 如果是带有 tags 的选择器，点击源表单区域两次关闭下拉菜单
              if (hasSelectTags) {
                elSelect.click();
                await new Promise((resolve) => setTimeout(resolve, 100));
                elSelect.click();
                await new Promise((resolve) => setTimeout(resolve, 100));
              }
            }

            markElementFilled(elSelect);
          } catch (error) {
            console.error("处理 el-select 失败:", error);
          }
        }

        // 3. 处理 el-checkbox
        const elCheckbox = contentElement.querySelector(
          ":scope > .el-checkbox:not(.is-disabled):not(.is-checked):not([data-auto-filled])"
        );
        if (elCheckbox) {
          try {
            elCheckbox.click();
            markElementFilled(elCheckbox);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("处理 el-checkbox 失败:", error);
          }
        }

        // 4. 处理 el-radio-group
        const elRadioGroup = contentElement.querySelector(
          ":scope > .el-radio-group:not([data-auto-filled]):not(.is-disabled)"
        );
        if (elRadioGroup) {
          try {
            const radios = elRadioGroup.querySelectorAll(
              ".el-radio:not(.is-disabled)"
            );
            const visibleRadios = Array.from(radios).filter((radio) =>
              isElementVisible(radio)
            );

            if (visibleRadios.length > 0) {
              let selectedIndex = 0;

              // 根据标签内容智能选择
              if (labelText.includes("性别")) {
                for (let i = 0; i < visibleRadios.length; i++) {
                  const radioText = visibleRadios[i].textContent.toLowerCase();
                  if (radioText.includes("男")) {
                    selectedIndex = i;
                    break;
                  }
                }
              } else {
                selectedIndex = Math.floor(
                  Math.random() * visibleRadios.length
                );
              }

              visibleRadios[selectedIndex].click();
            }

            markElementFilled(elRadioGroup);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("处理 el-radio-group 失败:", error);
          }
        }

        // 5. 处理 el-date-picker
        const elDatePicker = contentElement.querySelector(
          ":scope > .el-date-editor:not(.el-range-editor):not([data-auto-filled]):not(.is-disabled)"
        );
        if (elDatePicker) {
          try {
            // 点击日期选择器打开日期面板
            console.log(elDatePicker.querySelector("input"), "=======AAAAAAA=");
            elDatePicker.querySelector("input").focus();
            // elDatePicker.click();
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 等待并查找活动的日期选择面板
            let datePicker = null;
            let attempts = 0;
            while (!datePicker && attempts < 10) {
              // 查找所有可见的日期选择器面板
              const datePickers = document.querySelectorAll(".el-date-picker");
              const visiblePickers = Array.from(datePickers).filter(
                (picker) =>
                  isElementVisible(picker) &&
                  !picker.classList.contains("el-date-picker--hidden")
              );

              if (visiblePickers.length > 0) {
                // 选择最后一个可见的（通常是最新打开的）
                datePicker = visiblePickers[visiblePickers.length - 1];
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
              attempts++;
            }

            if (datePicker && isElementVisible(datePicker)) {
              // 查找可点击的日期单元格
              const dateCells = datePicker.querySelectorAll(
                ".el-date-table__row .available:not(.disabled)"
              );
              console.log(dateCells, "=======bbbbbbbb=");
              const visibleCells = Array.from(dateCells).filter((cell) =>
                isElementVisible(cell)
              );

              if (visibleCells.length > 0) {
                // 随机选择一个日期
                const randomIndex = Math.floor(
                  Math.random() * visibleCells.length
                );
                visibleCells[randomIndex].click();
                await new Promise((resolve) => setTimeout(resolve, 300));
              } else {
                // 如果没有找到日期单元格，尝试查找其他可点击的日期元素
                const dateButtons = datePicker.querySelectorAll(
                  "td:not(.disabled):not(.next-month):not(.prev-month)"
                );
                const visibleButtons = Array.from(dateButtons).filter(
                  (btn) =>
                    isElementVisible(btn) && btn.textContent.trim() !== ""
                );

                if (visibleButtons.length > 0) {
                  const randomIndex = Math.floor(
                    Math.random() * visibleButtons.length
                  );
                  visibleButtons[randomIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 300));
                }
              }

              // 点击确定按钮
              const footer = datePicker.querySelector(
                ".el-picker-panel__footer"
              );
              if (footer) {
                const buttons = footer.querySelectorAll("button");
                if (buttons.length > 0) {
                  const lastButton = buttons[buttons.length - 1];
                  if (lastButton && isElementVisible(lastButton)) {
                    lastButton.click();
                    await new Promise((resolve) => setTimeout(resolve, 300));
                  }
                }
              }
            }

            markElementFilled(elDatePicker);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error("处理 el-date-picker 失败:", error);
          }
          // 额外等待确保日期选择器完全关闭
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        // 6. 处理 el-date-range-picker
        const elDateRangePicker = contentElement.querySelector(
          ":scope > .el-date-editor.el-range-editor:not([data-auto-filled]):not(.is-disabled)"
        );
        if (elDateRangePicker) {
          try {
            // 点击日期范围选择器打开日期面板
            console.log("处理日期范围选择器:", elDateRangePicker);
            elDateRangePicker.click();
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 等待并查找活动的日期范围选择面板
            let dateRangePicker = null;
            let attempts = 0;
            while (!dateRangePicker && attempts < 10) {
              // 查找所有可见的日期范围选择器面板
              const rangePickers = document.querySelectorAll(
                ".el-date-range-picker"
              );
              console.log("找到的日期范围面板:", rangePickers.length);
              const visibleRangePickers = Array.from(rangePickers).filter(
                (picker) =>
                  isElementVisible(picker) &&
                  !picker.classList.contains("el-date-picker--hidden")
              );
              console.log("可见的日期范围面板:", visibleRangePickers.length);

              if (visibleRangePickers.length > 0) {
                // 选择最后一个可见的（通常是最新打开的）
                dateRangePicker =
                  visibleRangePickers[visibleRangePickers.length - 1];
                console.log("选择的日期范围面板:", dateRangePicker);
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
              attempts++;
            }

            if (dateRangePicker && isElementVisible(dateRangePicker)) {
              console.log("开始处理日期范围面板");

              // 查找左侧面板（开始日期）
              const leftPanel = dateRangePicker.querySelector(
                ".el-date-range-picker__content.is-left"
              );
              console.log("左侧面板:", leftPanel);

              if (leftPanel) {
                const leftDateCells = leftPanel.querySelectorAll(
                  ".el-date-table__row .available:not(.disabled)"
                );
                console.log(leftDateCells, "=======开始日期选项=");
                const visibleLeftCells = Array.from(leftDateCells).filter(
                  (cell) => isElementVisible(cell)
                );

                if (visibleLeftCells.length > 0) {
                  // 选择开始日期（选择前面的日期）
                  const startIndex = Math.floor(
                    Math.random() * Math.min(5, visibleLeftCells.length)
                  );
                  console.log("点击开始日期:", visibleLeftCells[startIndex]);
                  visibleLeftCells[startIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }

              // 查找右侧面板（结束日期）
              const rightPanel = dateRangePicker.querySelector(
                ".el-date-range-picker__content.is-right"
              );
              console.log("右侧面板:", rightPanel);

              if (rightPanel) {
                const rightDateCells = rightPanel.querySelectorAll(
                  ".el-date-table__row .available:not(.disabled)"
                );
                console.log(rightDateCells, "=======结束日期选项=");
                const visibleRightCells = Array.from(rightDateCells).filter(
                  (cell) => isElementVisible(cell)
                );

                if (visibleRightCells.length > 0) {
                  // 选择结束日期（选择后面的日期）
                  const endIndex = Math.floor(
                    Math.random() * visibleRightCells.length
                  );
                  console.log("点击结束日期:", visibleRightCells[endIndex]);
                  visibleRightCells[endIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }

              // 如果左右面板没有找到，尝试查找通用的日期单元格
              if (!leftPanel && !rightPanel) {
                console.log("没有找到左右面板，尝试通用方式");
                const allDateCells = dateRangePicker.querySelectorAll(
                  ".el-date-table__row .available:not(.disabled)"
                );
                console.log(allDateCells, "=======所有日期选项=");
                const visibleAllCells = Array.from(allDateCells).filter(
                  (cell) => isElementVisible(cell)
                );

                if (visibleAllCells.length >= 2) {
                  // 选择开始日期
                  const startIndex = Math.floor(
                    Math.random() * Math.min(5, visibleAllCells.length)
                  );
                  console.log("点击开始日期:", visibleAllCells[startIndex]);
                  visibleAllCells[startIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 400));

                  // 选择结束日期（确保在开始日期之后）
                  const remainingCells = visibleAllCells.slice(startIndex + 1);
                  if (remainingCells.length > 0) {
                    const endIndex = Math.floor(
                      Math.random() * remainingCells.length
                    );
                    console.log("点击结束日期:", remainingCells[endIndex]);
                    remainingCells[endIndex].click();
                    await new Promise((resolve) => setTimeout(resolve, 400));
                  }
                }
              }

              // 点击确定按钮
              const footer = dateRangePicker.querySelector(
                ".el-picker-panel__footer"
              );
              if (footer) {
                const buttons = footer.querySelectorAll("button");
                if (buttons.length > 0) {
                  const lastButton = buttons[buttons.length - 1];
                  if (lastButton && isElementVisible(lastButton)) {
                    console.log("点击确定按钮:", lastButton);
                    lastButton.click();
                    await new Promise((resolve) => setTimeout(resolve, 300));
                  }
                }
              }
            } else {
              console.log("没有找到可见的日期范围面板");
            }

            markElementFilled(elDateRangePicker);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error("处理 el-date-range-picker 失败:", error);
          }
          // 额外等待确保日期范围选择器完全关闭
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        markElementFilled(formItem);
      } catch (error) {
        console.error("处理 el-form-item 失败:", error);
      }
    }
  }

  // 处理Ant Design组件
  async function handleAntdComponents() {
    updateStatus("正在处理 Ant Design 组件...");

    // 处理 ant-form-item 组件
    const antFormItems = document.querySelectorAll(
      ".ant-form-item:not([data-auto-filled])"
    );
    for (const formItem of antFormItems) {
      if (!isElementVisible(formItem)) continue;

      try {
        // 获取标签文本
        const labelElement = formItem.querySelector(
          ".ant-form-item-label label"
        );
        const labelText = labelElement
          ? labelElement.textContent.trim().replace(":", "").replace("：", "")
          : "";

        console.log("处理Ant Design表单项:", labelText);

        // 获取表单控件容器
        const controlElement = formItem.querySelector(".ant-form-item-control");
        if (!controlElement) continue;

        // 1. 处理 ant-input
        const antInput = controlElement.querySelector(
          ".ant-input:not([data-auto-filled]):not(.ant-picker-input)"
        );
        if (antInput && !isElementFilled(antInput)) {
          if (antInput.type === "text") {
            await fillElementFormElement(antInput, labelText);
          } else {
            await fillElementFormElement(antInput);
          }
          markElementFilled(antInput);
        }

        // 2. 处理 ant-input (textarea)
        const antTextarea = controlElement.querySelector(
          ".ant-input:not([data-auto-filled])[rows]"
        );
        if (antTextarea && !isElementFilled(antTextarea)) {
          await fillElementFormElement(antTextarea, labelText);
          markElementFilled(antTextarea);
        }

        // 3. 处理 ant-select
        const antSelect = controlElement.querySelector(
          ".ant-select:not([data-auto-filled]):not(.ant-select-disabled)"
        );
        if (antSelect && !isElementFilled(antSelect)) {
          try {
            // 点击选择器打开下拉菜单
            const selector = antSelect.querySelector(".ant-select-selector");
            if (selector) {
              selector.click();
              await new Promise((resolve) => setTimeout(resolve, 300));

              // 查找并点击选项
              const dropdownItems = document.querySelectorAll(
                ".ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:not(.ant-select-item-option-disabled)"
              );
              const visibleItems = Array.from(dropdownItems).filter((item) =>
                isElementVisible(item)
              );

              if (visibleItems.length > 0) {
                const selectedIndex = Math.floor(
                  Math.random() * visibleItems.length
                );
                visibleItems[selectedIndex].click();
                await new Promise((resolve) => setTimeout(resolve, 200));
              }
            }
            markElementFilled(antSelect);
          } catch (error) {
            console.error("处理 ant-select 失败:", error);
          }
        }

        // 4. 处理 ant-checkbox
        const antCheckbox = controlElement.querySelector(
          ".ant-checkbox:not(.ant-checkbox-disabled):not(.ant-checkbox-checked):not([data-auto-filled])"
        );
        if (antCheckbox) {
          try {
            const checkboxInput = antCheckbox.querySelector(
              "input[type='checkbox']"
            );
            if (checkboxInput) {
              checkboxInput.click();
            } else {
              antCheckbox.click();
            }
            markElementFilled(antCheckbox);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("处理 ant-checkbox 失败:", error);
          }
        }

        // 5. 处理 ant-radio-group
        const antRadioGroup = controlElement.querySelector(
          ".ant-radio-group:not([data-auto-filled])"
        );
        if (antRadioGroup) {
          try {
            const radios = antRadioGroup.querySelectorAll(
              ".ant-radio:not(.ant-radio-disabled)"
            );
            const visibleRadios = Array.from(radios).filter((radio) =>
              isElementVisible(radio)
            );

            if (visibleRadios.length > 0) {
              let selectedIndex = 0;

              // 根据标签内容智能选择
              if (labelText.includes("性别")) {
                for (let i = 0; i < visibleRadios.length; i++) {
                  const radioText = visibleRadios[i].textContent.toLowerCase();
                  if (radioText.includes("男")) {
                    selectedIndex = i;
                    break;
                  }
                }
              } else {
                selectedIndex = Math.floor(
                  Math.random() * visibleRadios.length
                );
              }

              const radioInput = visibleRadios[selectedIndex].querySelector(
                "input[type='radio']"
              );
              if (radioInput) {
                radioInput.click();
              } else {
                visibleRadios[selectedIndex].click();
              }
            }

            markElementFilled(antRadioGroup);
            await new Promise((resolve) => setTimeout(resolve, 100));
          } catch (error) {
            console.error("处理 ant-radio-group 失败:", error);
          }
        }

        // 6. 处理 ant-picker (DatePicker)
        const antDatePicker = controlElement.querySelector(
          ".ant-picker:not(.ant-picker-range):not([data-auto-filled]):not(.ant-picker-disabled)"
        );
        if (antDatePicker) {
          try {
            console.log("处理Ant Design日期选择器:", antDatePicker);
            // 点击日期选择器打开面板
            antDatePicker.click();
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 查找日期选择面板
            let datePicker = null;
            let attempts = 0;
            while (!datePicker && attempts < 10) {
              const pickers = document.querySelectorAll(
                ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)"
              );
              const visiblePickers = Array.from(pickers).filter((picker) =>
                isElementVisible(picker)
              );

              if (visiblePickers.length > 0) {
                datePicker = visiblePickers[visiblePickers.length - 1];
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
              attempts++;
            }

            if (datePicker && isElementVisible(datePicker)) {
              // 查找可点击的日期单元格
              const dateCells = datePicker.querySelectorAll(
                ".ant-picker-cell:not(.ant-picker-cell-disabled)"
              );
              const visibleCells = Array.from(dateCells).filter(
                (cell) =>
                  isElementVisible(cell) && cell.textContent.trim() !== ""
              );

              if (visibleCells.length > 0) {
                const randomIndex = Math.floor(
                  Math.random() * visibleCells.length
                );
                visibleCells[randomIndex].click();
                await new Promise((resolve) => setTimeout(resolve, 300));
              }
            }

            markElementFilled(antDatePicker);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error("处理 ant-picker 失败:", error);
          }
        }

        // 7. 处理 ant-picker-range (RangePicker)
        const antRangePicker = controlElement.querySelector(
          ".ant-picker.ant-picker-range:not([data-auto-filled]):not(.ant-picker-disabled)"
        );
        if (antRangePicker) {
          try {
            console.log("处理Ant Design日期范围选择器:", antRangePicker);
            // 点击日期范围选择器打开面板
            antRangePicker.click();
            await new Promise((resolve) => setTimeout(resolve, 500));

            // 查找日期范围选择面板
            let rangePicker = null;
            let attempts = 0;
            while (!rangePicker && attempts < 10) {
              const pickers = document.querySelectorAll(
                ".ant-picker-dropdown:not(.ant-picker-dropdown-hidden)"
              );
              const visiblePickers = Array.from(pickers).filter(
                (picker) =>
                  isElementVisible(picker) &&
                  picker.querySelector(".ant-picker-range-wrapper")
              );

              if (visiblePickers.length > 0) {
                rangePicker = visiblePickers[visiblePickers.length - 1];
                break;
              }

              await new Promise((resolve) => setTimeout(resolve, 100));
              attempts++;
            }

            if (rangePicker && isElementVisible(rangePicker)) {
              // 查找左右面板
              const panels = rangePicker.querySelectorAll(".ant-picker-panel");

              if (panels.length >= 2) {
                // 处理左面板（开始日期）
                const leftCells = panels[0].querySelectorAll(
                  ".ant-picker-cell:not(.ant-picker-cell-disabled)"
                );
                const visibleLeftCells = Array.from(leftCells).filter(
                  (cell) =>
                    isElementVisible(cell) && cell.textContent.trim() !== ""
                );

                if (visibleLeftCells.length > 0) {
                  const startIndex = Math.floor(
                    Math.random() * Math.min(5, visibleLeftCells.length)
                  );
                  visibleLeftCells[startIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }

                // 处理右面板（结束日期）
                const rightCells = panels[1].querySelectorAll(
                  ".ant-picker-cell:not(.ant-picker-cell-disabled)"
                );
                const visibleRightCells = Array.from(rightCells).filter(
                  (cell) =>
                    isElementVisible(cell) && cell.textContent.trim() !== ""
                );

                if (visibleRightCells.length > 0) {
                  const endIndex = Math.floor(
                    Math.random() * visibleRightCells.length
                  );
                  visibleRightCells[endIndex].click();
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }
              }
            }

            markElementFilled(antRangePicker);
            await new Promise((resolve) => setTimeout(resolve, 500));
          } catch (error) {
            console.error("处理 ant-picker-range 失败:", error);
          }
          await new Promise((resolve) => setTimeout(resolve, 500));
        }

        markElementFilled(formItem);
      } catch (error) {
        console.error("处理 ant-form-item 失败:", error);
      }
    }
  }

  // 开始填充表单
  async function startFilling() {
    try {
      updateStatus("开始处理 Element UI 表单...");

      // 处理Element UI组件
      await handleElementUIComponents();

      // 处理Ant Design组件
      await handleAntdComponents();

      updateStatus("填充完成！");
    } catch (error) {
      console.error("填充过程出错:", error);
      updateStatus("填充出错，请重试");
    }
  }

  // 初始化
  function init() {
    setTimeout(() => {
      createUI();
    }, 1000);
  }

  init();
})();
