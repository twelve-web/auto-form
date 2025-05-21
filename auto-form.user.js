// ==UserScript==
// @name         智能表单自动填充助手
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  自动填充网页表单，支持随机生成内容，兼容主流UI框架
// @author       twelve
// @match        *://*/*
// @grant        GM_addStyle
// @downloadURL  https://github.com/twelve-web/auto-form/master/auto-form.user.js
// @updateURL    https://github.com/twelve-web/auto-form/master/auto-form.user.js
// ==/UserScript==

(function() {
    'use strict';
    
    // 样式隔离
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
        
        .auto-form-panel:hover {
            box-shadow: 0 12px 48px rgba(0, 0, 0, 0.4);
        }
        
        .auto-form-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
            color: #fff;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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
            text-transform: uppercase;
            letter-spacing: 1px;
            font-size: 14px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(60, 111, 243, 0.3);
        }
        
        .auto-form-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 16px rgba(60, 111, 243, 0.4);
        }
        
        .auto-form-button:active {
            transform: translateY(1px);
        }
        
        .auto-form-close {
            background: linear-gradient(90deg, #f45b69 0%, #ff7a85 100%);
            box-shadow: 0 4px 12px rgba(244, 91, 105, 0.3);
        }
        
        .auto-form-close:hover {
            box-shadow: 0 6px 16px rgba(244, 91, 105, 0.4);
        }
        
        .auto-form-status {
            font-size: 12px;
            margin-top: 10px;
            color: #a0e4ff;
            text-align: center;
        }
        
        .auto-form-typing {
            position: relative;
            overflow: hidden;
            border-radius: 4px;
        }
        
        .auto-form-typing::after {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: rgba(60, 111, 243, 0.1);
            top: 0;
            left: 0;
            animation: typing-pulse 1.5s infinite;
        }
        
        @keyframes typing-pulse {
            0% { opacity: 0.2; }
            50% { opacity: 0.4; }
            100% { opacity: 0.2; }
        }
    `);

    // 创建UI面板
    function createUI() {
        const panel = document.createElement('div');
        panel.className = 'auto-form-panel';
        panel.id = 'auto-form-panel';
        
        const title = document.createElement('div');
        title.className = 'auto-form-title';
        title.textContent = '智能表单填充助手';
        
        const fillButton = document.createElement('button');
        fillButton.className = 'auto-form-button';
        fillButton.textContent = '开始填充';
        fillButton.onclick = startFilling;
        
        const closeButton = document.createElement('button');
        closeButton.className = 'auto-form-button auto-form-close';
        closeButton.textContent = '关闭助手';
        closeButton.onclick = removeUI;
        
        const status = document.createElement('div');
        status.className = 'auto-form-status';
        status.id = 'auto-form-status';
        status.textContent = '准备就绪';
        
        panel.appendChild(title);
        panel.appendChild(fillButton);
        panel.appendChild(closeButton);
        panel.appendChild(status);
        
        document.body.appendChild(panel);
    }

    // 移除UI
    function removeUI() {
        const panel = document.getElementById('auto-form-panel');
        if (panel) {
            panel.remove();
        }
    }

    // 更新状态信息
    function updateStatus(message) {
        const status = document.getElementById('auto-form-status');
        if (status) {
            status.textContent = message;
        }
    }

    // 随机生成文本
    function generateRandomText(minLength = 10) {
        const phrases = [
            "根据最新的市场调研显示，消费者对产品质量的关注度持续上升，这对企业提出了更高的要求。",
            "在当前竞争激烈的环境中，创新能力成为企业核心竞争力的重要组成部分。",
            "数字化转型已经成为各行各业的必然趋势，企业需要积极适应这一变化。",
            "随着人工智能技术的快速发展，传统行业正面临前所未有的挑战和机遇。",
            "环保意识的提高使得可持续发展成为企业战略规划中不可忽视的因素。",
            "员工培训和发展计划对提升组织整体绩效具有显著作用。",
            "客户体验已经成为品牌差异化的关键因素，需要企业全方位关注。",
            "供应链韧性建设在全球不确定性增加的背景下变得尤为重要。",
            "数据驱动决策正逐渐替代传统的经验判断，成为管理的新范式。",
            "远程办公模式的普及要求企业重新审视现有的管理制度和企业文化。"
        ];
        
        let result = '';
        while (result.length < minLength) {
            result += phrases[Math.floor(Math.random() * phrases.length)] + ' ';
        }
        
        return result.trim();
    }

    // 生成随机手机号
    function generatePhone() {
        const prefixes = ['138', '139', '137', '136', '135', '134', '159', '158', '157', '150', '151', '152', '188', '187', '182', '183', '184', '178', '198', '199'];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const suffix = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + suffix;
    }

    // 生成随机数字
    function generateRandomNumber(min = 1, max = 100) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // 生成随机日期
    function generateRandomDate(startYear = 2000, endYear = 2023) {
        const start = new Date(startYear, 0, 1).getTime();
        const end = new Date(endYear, 11, 31).getTime();
        const randomDate = new Date(start + Math.random() * (end - start));
        
        const year = randomDate.getFullYear();
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const day = String(randomDate.getDate()).padStart(2, '0');
        
        return `${year}-${month}-${day}`;
    }

    // 检查元素是否可见
    function isElementVisible(element) {
        if (!element) return false;
        
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' && 
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    // 检查元素是否禁用
    function isElementDisabled(element) {
        if (!element) return true;
        
        // 检查disabled属性
        if (element.disabled === true) return true;
        
        // 检查是否有disabled类名
        if (element.classList.contains('disabled') || 
            element.classList.contains('is-disabled') || 
            element.classList.contains('ant-checkbox-disabled') || 
            element.classList.contains('ant-radio-disabled') || 
            element.classList.contains('el-checkbox-disabled') || 
            element.classList.contains('el-radio-disabled') || 
            element.classList.contains('van-field--disabled')) {
            return true;
        }
        
        // 检查父元素是否有disabled类
        let parent = element.parentElement;
        if (parent) {
            if (parent.classList.contains('disabled') || 
                parent.classList.contains('is-disabled') || 
                parent.classList.contains('ant-checkbox-wrapper-disabled') || 
                parent.classList.contains('ant-radio-wrapper-disabled') || 
                parent.classList.contains('el-checkbox-disabled') || 
                parent.classList.contains('el-radio-disabled') || 
                parent.classList.contains('van-field--disabled')) {
                return true;
            }
        }
        
        // 检查aria属性
        if (element.getAttribute('aria-disabled') === 'true') return true;
        
        return false;
    }

    // 检查元素是否已填充
    function isElementFilled(element) {
        if (element.hasAttribute('data-auto-filled')) {
            return true;
        }
        
        // 检查是否已有值
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            return element.value.trim() !== '';
        } else if (element.tagName === 'SELECT') {
            return element.selectedIndex > 0;
        }
        
        return false;
    }

    // 标记元素已填充
    function markElementFilled(element) {
        element.setAttribute('data-auto-filled', 'true');
    }

    // 模拟人工输入
    async function simulateTyping(element, text) {
        // 添加打字效果类
        element.classList.add('auto-form-typing');
        
        // 清空现有内容
        element.value = '';
        element.focus();
        
        // 逐字输入
        for (let i = 0; i < text.length; i++) {
            element.value += text[i];
            
            // 触发输入事件
            element.dispatchEvent(new Event('input', { bubbles: true }));
            
            // 随机延迟，模拟人工输入速度
            const delay = 30 + Math.random() * 50;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
        
        // 触发变更事件
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // 移除打字效果类
        element.classList.remove('auto-form-typing');
        
        // 重要：确保值被设置并保留
        setTimeout(() => {
            if (element.value !== text) {
                console.log('值丢失，重新设置');
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, 100);
        
        return text; // 返回设置的文本，方便后续使用
    }

    // 立即填充（不模拟打字效果）
    function instantFill(element, text) {
        element.value = text;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        
        // 确保值被保留
        setTimeout(() => {
            if (element.value !== text) {
                console.log('值丢失，重新设置');
                element.value = text;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }, 100);
        
        return text;
    }

    // 填充富文本编辑器
    async function fillRichTextEditor(element) {
        const text = generateRandomText(20);
        
        // 尝试不同的富文本编辑器接口
        if (element.contentEditable === 'true') {
            element.focus();
            element.innerHTML = text;
            element.blur();
            markElementFilled(element);
            return true;
        }
        
        // 查找iframe内的编辑器
        const iframes = element.querySelectorAll('iframe');
        for (let iframe of iframes) {
            try {
                const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                const editorBody = iframeDoc.body;
                
                if (editorBody && editorBody.contentEditable === 'true') {
                    editorBody.focus();
                    editorBody.innerHTML = text;
                    editorBody.blur();
                    markElementFilled(element);
                    return true;
                }
            } catch (e) {
                console.error('富文本编辑器填充失败:', e);
            }
        }
        
        return false;
    }

    // 填充表单元素
    async function fillFormElement(element) {
        // 如果元素已填充、不可见或已禁用，则跳过
        if (isElementFilled(element) || !isElementVisible(element) || isElementDisabled(element)) {
            return;
        }
        
        try {
            const tagName = element.tagName.toLowerCase();
            let filledValue = null;
            
            // 处理不同类型的表单元素
            if (tagName === 'input') {
                const type = (element.type || 'text').toLowerCase();
                
                // 获取最大长度限制
                const maxLength = element.maxLength > 0 ? element.maxLength : 100;
                
                // 根据不同输入类型处理
                switch (type) {
                    case 'text':
                    case 'search':
                    case 'url':
                    case 'email':
                    case 'tel':
                        // 检查属性名或ID中是否包含手机号/电话相关字段
                        const nameAttr = (element.name || '').toLowerCase();
                        const idAttr = (element.id || '').toLowerCase();
                        const placeholderAttr = (element.placeholder || '').toLowerCase();
                        
                        if (type === 'tel' || nameAttr.includes('phone') || nameAttr.includes('tel') || nameAttr.includes('mobile') ||
                            idAttr.includes('phone') || idAttr.includes('tel') || idAttr.includes('mobile') ||
                            placeholderAttr.includes('手机') || placeholderAttr.includes('电话')) {
                            // 对于手机号，使用模拟输入
                            filledValue = await simulateTyping(element, generatePhone());
                        } else if (type === 'email') {
                            filledValue = instantFill(element, `test${Math.floor(Math.random() * 10000)}@example.com`);
                        } else {
                            // 普通文本，立即填充
                            const textLength = Math.min(maxLength, 50);
                            filledValue = instantFill(element, generateRandomText(textLength).substring(0, textLength));
                        }
                        break;
                    
                    case 'number':
                    case 'range':
                        const value = generateRandomNumber(
                            element.min ? parseInt(element.min) : 1,
                            element.max ? parseInt(element.max) : 100
                        );
                        element.value = value;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        filledValue = value;
                        break;
                    
                    case 'date':
                    case 'datetime':
                    case 'datetime-local':
                        const dateValue = generateRandomDate();
                        element.value = dateValue;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        filledValue = dateValue;
                        break;
                    
                    case 'checkbox':
                    case 'radio':
                        if (!element.checked) {
                            // 直接触发点击事件
                            element.click();
                            
                            // 确保checked属性被设置
                            if (!element.checked) {
                                element.checked = true;
                                element.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                            
                            // 等待短暂时间确保事件处理完成
                            await new Promise(resolve => setTimeout(resolve, 50));
                            filledValue = true;
                        }
                        break;
                    
                    default:
                        filledValue = instantFill(element, generateRandomText(10).substring(0, maxLength));
                        break;
                }
            } else if (tagName === 'textarea') {
                // 对于textarea，特殊处理以避免内容消失
                const generatedText = generateRandomText(30);
                
                // 方法1：模拟输入
                filledValue = await simulateTyping(element, generatedText);
                
                // 方法2：直接设置，作为备份
                setTimeout(() => {
                    if (!element.value || element.value.trim() === '') {
                        console.log('Textarea内容消失，尝试方法2');
                        element.value = generatedText;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                        
                        // 备用方法：尝试直接设置innerHTML
                        if (!element.value) {
                            try {
                                element.innerHTML = generatedText;
                            } catch (e) {
                                console.error('设置innerHTML失败:', e);
                            }
                        }
                    }
                }, 300);
                
                // 方法3：绑定Textarea的focus和blur事件
                const originalValue = generatedText;
                
                // 当失去焦点时检查并恢复值
                const blurHandler = () => {
                    if (!element.value || element.value.trim() === '') {
                        console.log('失焦时检测到textarea值丢失，恢复');
                        element.value = originalValue;
                        element.dispatchEvent(new Event('input', { bubbles: true }));
                        element.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                };
                
                // 临时添加事件监听器
                element.addEventListener('blur', blurHandler);
                
                // 一段时间后移除监听器
                setTimeout(() => {
                    element.removeEventListener('blur', blurHandler);
                }, 5000);
            } else if (tagName === 'select') {
                const options = Array.from(element.options).filter(option => !option.disabled && option.value);
                
                if (options.length > 1) {
                    // 跳过第一个选项（通常是默认的空选项）
                    const randomIndex = 1 + Math.floor(Math.random() * (options.length - 1));
                    element.selectedIndex = randomIndex;
                    element.dispatchEvent(new Event('change', { bubbles: true }));
                    
                    // 确保事件被触发
                    await new Promise(resolve => setTimeout(resolve, 50));
                    filledValue = options[randomIndex].value;
                }
            } else if (element.contentEditable === 'true' || element.querySelector('[contenteditable="true"]') || element.querySelector('iframe')) {
                // 尝试填充富文本编辑器
                filledValue = await fillRichTextEditor(element);
            }
            
            // 标记元素已填充
            if (filledValue !== null) {
                markElementFilled(element);
                
                // 保存填充值作为数据属性，用于后续可能的恢复
                try {
                    element.dataset.autoFilledValue = 
                        (typeof filledValue === 'string' || typeof filledValue === 'number') ? 
                        String(filledValue) : 'filled';
                } catch (e) {
                    console.log('无法设置数据属性:', e);
                }
            }
            
            // 等待一段时间，避免操作过快
            await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
        } catch (error) {
            console.error('填充元素失败:', error, element);
        }
    }

    // 过滤可见元素
    function filterVisibleElements(elements) {
        return Array.from(elements).filter(el => isElementVisible(el) && !isElementDisabled(el));
    }

    // 处理Element UI选择器
    async function handleElementUIComponents() {
        // 处理 el-select 组件
        const elSelects = document.querySelectorAll('.el-select:not([data-auto-filled]):not(.is-disabled)');
        for (const elSelect of filterVisibleElements(elSelects)) {
            try {
                // 点击打开下拉菜单
                elSelect.click();
                await new Promise(resolve => setTimeout(resolve, 300)); // 等待下拉菜单打开
                
                // 获取下拉选项
                const dropdownItems = document.querySelectorAll('.el-select-dropdown__item:not(.is-disabled)');
                const visibleItems = filterVisibleElements(dropdownItems);
                
                if (visibleItems.length > 0) {
                    // 随机选择一个选项（避开第一个选项，通常是占位符）
                    const randomIndex = Math.min(1, visibleItems.length - 1) + Math.floor(Math.random() * Math.max(visibleItems.length - 1, 1));
                    const selectedItem = visibleItems[randomIndex] || visibleItems[0];
                    
                    // 点击选项
                    selectedItem.click();
                    await new Promise(resolve => setTimeout(resolve, 200));
                }
                
                markElementFilled(elSelect);
            } catch (error) {
                console.error('处理 el-select 失败:', error);
            }
        }
        
        // 处理 el-checkbox 组件 - 立即填充
        const elCheckboxes = document.querySelectorAll('.el-checkbox:not(.is-disabled):not(.is-checked):not([data-auto-filled])');
        const visibleCheckboxes = filterVisibleElements(elCheckboxes);
        for (const checkbox of visibleCheckboxes) {
            try {
                // 直接点击选中
                checkbox.click();
                markElementFilled(checkbox);
            } catch (error) {
                console.error('处理 el-checkbox 失败:', error);
            }
        }
        
        // 处理 el-radio 组件 - 立即填充
        const elRadioGroups = document.querySelectorAll('.el-radio-group:not([data-auto-filled]):not(.is-disabled)');
        for (const group of filterVisibleElements(elRadioGroups)) {
            try {
                const radios = group.querySelectorAll('.el-radio:not(.is-disabled)');
                const visibleRadios = filterVisibleElements(radios);
                
                if (visibleRadios.length > 0) {
                    // 随机选择一个单选按钮
                    const randomIndex = Math.floor(Math.random() * visibleRadios.length);
                    visibleRadios[randomIndex].click();
                }
                
                markElementFilled(group);
            } catch (error) {
                console.error('处理 el-radio-group 失败:', error);
            }
        }
        
        // 处理独立的 el-radio 组件 - 立即填充
        const elRadios = document.querySelectorAll('.el-radio:not(.el-radio-group .el-radio):not(.is-disabled):not(.is-checked):not([data-auto-filled])');
        for (const radio of filterVisibleElements(elRadios)) {
            try {
                radio.click();
                markElementFilled(radio);
            } catch (error) {
                console.error('处理独立 el-radio 失败:', error);
            }
        }
    }

    // 处理Ant Design组件
    async function handleAntDesignComponents() {
        // 处理 ant-select 组件 - 按序点击
        const antSelects = document.querySelectorAll('.ant-select:not([data-auto-filled]):not(.ant-select-disabled)');
        for (const select of filterVisibleElements(antSelects)) {
            try {
                // 使用多种方法尝试触发 Ant Design Select 组件
                console.log('开始处理 ant-select:', select);
                
                // 方法1：直接设置值（通过查找和设置隐藏的input）
                const hiddenInput = select.querySelector('input[type="hidden"]');
                if (hiddenInput) {
                    // 查找可能的选项值
                    const possibleValues = [];
                    // 尝试查找已有的选项数据
                    try {
                        // 查找可能绑定在元素上的React属性
                        for (const key in select) {
                            if (key.startsWith('__reactProps$') || key.startsWith('__reactFiber$')) {
                                const reactData = select[key];
                                if (reactData && reactData.children && reactData.children.props) {
                                    const props = reactData.children.props;
                                    if (props.options && Array.isArray(props.options)) {
                                        props.options.forEach(option => {
                                            if (option && option.value) {
                                                possibleValues.push(option.value);
                                            }
                                        });
                                    }
                                }
                            }
                        }
                    } catch (e) {
                        console.log('查找React数据失败:', e);
                    }
                    
                    // 如果能找到值，直接设置
                    if (possibleValues.length > 0) {
                        const randomValue = possibleValues[Math.floor(Math.random() * possibleValues.length)];
                        hiddenInput.value = randomValue;
                        hiddenInput.dispatchEvent(new Event('input', { bubbles: true }));
                        hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));
                        console.log('直接设置ant-select隐藏input值:', randomValue);
                        markElementFilled(select);
                        continue; // 成功设置值，继续处理下一个select
                    }
                }
                
                // 方法2：模拟完整的用户点击操作
                const selector = select.querySelector('.ant-select-selector');
                if (!selector) {
                    console.log('未找到ant-select-selector元素');
                    continue;
                }
                
                // 清除任何可能已打开的下拉菜单
                document.body.click();
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 通过不同的事件方式依次触发选择器
                console.log('点击ant-select-selector');
                
                // 先尝试原生click
                selector.click();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 如果click不生效，尝试更多事件
                selector.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 100));
                selector.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 100));
                selector.dispatchEvent(new Event('focus', { bubbles: true }));
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // 强制添加激活类，模拟选择器被点击的状态
                select.classList.add('ant-select-focused');
                select.classList.add('ant-select-open');
                
                // 查找下拉菜单及选项
                // 可能的选择器排列，从最特定到最通用
                const selectors = [
                    '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item-option:not(.ant-select-item-option-disabled)',
                    '.ant-select-dropdown .ant-select-item-option:not(.ant-select-item-option-disabled)',
                    '.ant-select-dropdown:not(.ant-select-dropdown-hidden) .ant-select-item:not(.ant-select-item-disabled)',
                    '.ant-select-dropdown .ant-select-item:not(.ant-select-item-disabled)',
                    '.rc-virtual-list-holder-inner .ant-select-item',
                    '.ant-select-dropdown *[role="option"]'
                ];
                
                let dropdownItems = [];
                for (const s of selectors) {
                    const items = document.querySelectorAll(s);
                    if (items && items.length > 0) {
                        dropdownItems = Array.from(items);
                        console.log(`使用选择器 ${s} 找到 ${dropdownItems.length} 个选项`);
                        break;
                    }
                }
                
                if (dropdownItems.length > 0) {
                    // 随机选择一个选项
                    const randomIndex = dropdownItems.length > 1 ? 
                        Math.floor(Math.random() * dropdownItems.length) : 0;
                    const selectedItem = dropdownItems[randomIndex];
                    
                    console.log('选择ant-select选项:', selectedItem);
                    
                    // 尝试多种方式点击选项
                    try {
                        // 方式1: 直接点击
                        selectedItem.click();
                        await new Promise(resolve => setTimeout(resolve, 300));
                        
                        // 方式2: 模拟鼠标事件序列
                        selectedItem.dispatchEvent(new MouseEvent('mousedown', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));
                        await new Promise(resolve => setTimeout(resolve, 100));
                        
                        selectedItem.dispatchEvent(new MouseEvent('mouseup', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                        }));
                        
                        // 方式3: 如果有特定的点击区域，尝试点击它
                        const clickArea = selectedItem.querySelector('.ant-select-item-option-content');
                        if (clickArea) {
                            clickArea.click();
                        }
                    } catch (e) {
                        console.error('点击ant-select选项失败:', e);
                    }
                } else {
                    console.log('未找到ant-select的下拉选项，尝试关闭下拉菜单');
                }
                
                // 无论是否成功，都关闭下拉菜单
                await new Promise(resolve => setTimeout(resolve, 300));
                document.body.click();
                
                // 方法3：尝试通过直接设置显示文本
                const textSpan = select.querySelector('.ant-select-selection-item');
                if (textSpan) {
                    const placeholderText = textSpan.textContent || '';
                    if (!placeholderText || placeholderText.includes('请选择') || placeholderText.includes('Select')) {
                        textSpan.textContent = '已选择';
                        textSpan.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                }
                
                markElementFilled(select);
            } catch (error) {
                console.error('处理 ant-select 失败:', error);
                // 点击外部关闭潜在的开着的下拉菜单
                document.body.click();
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        // 处理 ant-checkbox 组件 - 立即填充
        const antCheckboxes = document.querySelectorAll('.ant-checkbox-wrapper:not([data-auto-filled]):not(.ant-checkbox-wrapper-disabled)');
        for (const checkbox of filterVisibleElements(antCheckboxes)) {
            try {
                if (!checkbox.querySelector('.ant-checkbox-checked') && !checkbox.querySelector('.ant-checkbox-disabled')) {
                    checkbox.click();
                }
                markElementFilled(checkbox);
            } catch (error) {
                console.error('处理 ant-checkbox 失败:', error);
            }
        }
        
        // 处理 ant-radio 组件 - 立即填充
        const antRadioGroups = document.querySelectorAll('.ant-radio-group:not([data-auto-filled]):not(.ant-radio-group-disabled)');
        for (const group of filterVisibleElements(antRadioGroups)) {
            try {
                const radios = group.querySelectorAll('.ant-radio-wrapper:not(.ant-radio-wrapper-disabled)');
                const visibleRadios = filterVisibleElements(radios);
                
                if (visibleRadios.length > 0) {
                    // 随机选择一个单选按钮
                    const randomIndex = Math.floor(Math.random() * visibleRadios.length);
                    visibleRadios[randomIndex].click();
                }
                
                markElementFilled(group);
            } catch (error) {
                console.error('处理 ant-radio-group 失败:', error);
            }
        }
    }

    // 处理Vant组件
    async function handleVantComponents() {
        // 处理 van-field 组件 - 立即填充
        const vanFields = document.querySelectorAll('.van-field:not([data-auto-filled]):not(.van-field--disabled)');
        for (const field of filterVisibleElements(vanFields)) {
            try {
                const input = field.querySelector('input');
                const textarea = field.querySelector('textarea');
                
                if (input && isElementVisible(input) && !isElementFilled(input) && !isElementDisabled(input)) {
                    await fillFormElement(input);
                } else if (textarea && isElementVisible(textarea) && !isElementFilled(textarea) && !isElementDisabled(textarea)) {
                    await fillFormElement(textarea);
                }
                
                markElementFilled(field);
            } catch (error) {
                console.error('处理 van-field 失败:', error);
            }
        }
        
        // 处理 van-checkbox 组件 - 立即填充
        const vanCheckboxes = document.querySelectorAll('.van-checkbox:not([data-auto-filled]):not(.van-checkbox--disabled)');
        for (const checkbox of filterVisibleElements(vanCheckboxes)) {
            try {
                if (!checkbox.classList.contains('van-checkbox--checked')) {
                    checkbox.click();
                }
                markElementFilled(checkbox);
            } catch (error) {
                console.error('处理 van-checkbox 失败:', error);
            }
        }
        
        // 处理 van-radio 组件 - 立即填充
        const vanRadioGroups = document.querySelectorAll('.van-radio-group:not([data-auto-filled]):not(.van-radio-group--disabled)');
        for (const group of filterVisibleElements(vanRadioGroups)) {
            try {
                const radios = group.querySelectorAll('.van-radio:not(.van-radio--disabled)');
                const visibleRadios = filterVisibleElements(radios);
                
                if (visibleRadios.length > 0) {
                    // 随机选择一个单选按钮
                    const randomIndex = Math.floor(Math.random() * visibleRadios.length);
                    visibleRadios[randomIndex].click();
                }
                
                markElementFilled(group);
            } catch (error) {
                console.error('处理 van-radio-group 失败:', error);
            }
        }
    }

    // 查找并填充所有表单元素
    async function fillAllFormElements() {
        updateStatus('正在扫描表单元素...');
        
        // 获取所有表单元素
        const formElements = [];
        
        // 常规表单元素 - 不再使用:visible选择器
        const inputSelectors = 'input:not([type="submit"]):not([type="button"]):not([type="reset"]):not([type="hidden"]):not([readonly]):not([disabled])';
        const textareaSelectors = 'textarea:not([readonly]):not([disabled])';
        const selectSelectors = 'select:not([disabled])';
        
        // 添加可见的标准表单元素
        formElements.push(...filterVisibleElements(document.querySelectorAll(inputSelectors)));
        formElements.push(...filterVisibleElements(document.querySelectorAll(textareaSelectors)));
        formElements.push(...filterVisibleElements(document.querySelectorAll(selectSelectors)));
        
        // 富文本编辑器 - 不再使用:visible选择器
        formElements.push(...filterVisibleElements(document.querySelectorAll('[contenteditable="true"]')));
        
        const richTextSelectors = '.vditor-ir, .vditor-wysiwyg, .ck-editor__editable, .editor-container, .ql-editor, .fr-element, .tox-edit-area';
        formElements.push(...filterVisibleElements(document.querySelectorAll(richTextSelectors)));
        
        updateStatus(`找到 ${formElements.length} 个基础表单元素，开始填充...`);
        
        // 依次填充基础元素
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            updateStatus(`正在填充第 ${i+1}/${formElements.length} 个基础元素...`);
            await fillFormElement(element);
        }
        
        // 处理框架特定组件
        updateStatus('正在处理UI框架组件...');
        
        // 处理Element UI组件
        await handleElementUIComponents();
        
        // 处理Ant Design组件
        await handleAntDesignComponents();
        
        // 处理Vant组件
        await handleVantComponents();
        
        updateStatus('表单填充完成！请检查并提交');
        
        // 检查是否有二级表单显示出来
        setTimeout(async () => {
            // 获取新显示的表单元素，同样不使用:visible选择器
            const allNewElements = document.querySelectorAll(
                'input:not([data-auto-filled]):not([disabled]), textarea:not([data-auto-filled]):not([disabled]), ' +
                'select:not([data-auto-filled]):not([disabled]), [contenteditable="true"]:not([data-auto-filled])'
            );
            
            // 过滤出可见的非禁用元素
            const newElements = filterVisibleElements(allNewElements);
            
            if (newElements.length > 0) {
                updateStatus(`检测到 ${newElements.length} 个新表单元素，继续填充...`);
                
                // 填充新显示的元素
                for (let i = 0; i < newElements.length; i++) {
                    await fillFormElement(newElements[i]);
                }
                
                // 再次处理可能新出现的UI框架组件
                await handleElementUIComponents();
                await handleAntDesignComponents();
                await handleVantComponents();
                
                updateStatus('所有表单元素填充完成！');
            }
        }, 1000);
    }

    // 开始填充表单
    function startFilling() {
        fillAllFormElements().catch(error => {
            console.error('表单填充过程中出错:', error);
            updateStatus('填充出错，请重试');
        });
    }

    // 等待页面加载完成
    function init() {
        // 延迟创建UI，确保页面已完全加载
        setTimeout(() => {
            createUI();
        }, 1000);
    }

    // 启动脚本
    init();
})();
