        let notes = JSON.parse(localStorage.getItem('web_notes')) || [];
        let currentIndex = null;
        let currentFontSize = 16;
        
        let fullContentText = "";
        let currentPageIndex = 0; 
        let currentMode = 'scroll'; 
        let currentScrollSpeed = 0.8; 
        let autoScrollInterval = null;
        let isAutoScrolling = false;

        // --- 공통 마우스 휠 글자크기 조절 핸들러 (제목부, 본문부 모두 적용) ---
        function handleWheelZoom(event) {
            if (isAutoScrolling) {
                stopAutoScroll();
            }

            event.preventDefault();
            event.stopPropagation();
            
            if (event.deltaY < 0) { 
                changeFontSize(2);  // 휠 위로: 글자 확대
            } else { 
                changeFontSize(-2); // 휠 아래로: 글자 축소
            }
        }

        const contentInput = document.getElementById('contentInput');
        const titleWheelArea = document.getElementById('titleWheelArea');

        if (contentInput) {
            contentInput.addEventListener('wheel', handleWheelZoom, { passive: false });
        }
        if (titleWheelArea) {
            titleWheelArea.addEventListener('wheel', handleWheelZoom, { passive: false });
        }

        // --- DOM 로드 완료 후 각종 이벤트 리스너 및 초기화 세팅 ---
        window.addEventListener('DOMContentLoaded', () => {
            const body = document.body;
            const themeBtn = document.getElementById('themeToggleBtn');
            const fontSelect = document.getElementById('fontSelect');
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTheme === 'light') {
                body.classList.remove('dark-mode');
                if (themeBtn) themeBtn.innerText = '🌙 전환';
            } else {
                body.classList.add('dark-mode');
                if (themeBtn) themeBtn.innerText = '☀️ 전환';
            }
            
            const savedFont = localStorage.getItem('selectedFont');
            if (savedFont && fontSelect) {
                body.style.fontFamily = savedFont;
                fontSelect.value = savedFont;
            }

            // --- 속도 조절 슬라이더 위 마우스 휠로 속도 증감 기능 ---
            const speedRangeInput = document.getElementById('scrollSpeedRange');
            if (speedRangeInput) {
                speedRangeInput.addEventListener('wheel', function(event) {
                    event.preventDefault(); 
                    event.stopPropagation();
                    
                    let currentVal = parseFloat(this.value);
                    let stepVal = parseFloat(this.step) || 0.1;
                    
                    if (event.deltaY < 0) {
                        currentVal = Math.min(parseFloat(this.max) || 5.0, currentVal + stepVal);
                    } else {
                        currentVal = Math.max(parseFloat(this.min) || 1.0, currentVal - stepVal);
                    }
                    
                    this.value = currentVal.toFixed(1);
                    updateScrollSpeed(this.value);
                }, { passive: false });
            }
            
            toggleViewMode(true); 
            refreshView();
        });

        // --- 상단 토글형 모드 전환 함수 ---
        function toggleViewMode(isInit = false) {
            const toggleBtn = document.getElementById('btnToggleMode');
            const scrollToolbar = document.getElementById('scrollToolbar'); 
            const pageNavToolbar = document.getElementById('pageNavToolbar'); 
            const pageDisplay = document.getElementById('currentPageDisplay'); 
            const contentDiv = document.getElementById('contentInput');

            if (!isInit) {
                if (isAutoScrolling) {
                    stopAutoScroll();
                }
                
                if (currentMode === 'page') {
                    let pages = splitTextIntoPages(fullContentText);
                    if (pages.length > 0 && currentPageIndex < pages.length) {
                        pages[currentPageIndex] = contentDiv.innerText;
                        fullContentText = pages.join("");
                    }
                } else {
                    fullContentText = contentDiv.innerText;
                }

                currentMode = (currentMode === 'scroll') ? 'page' : 'scroll';
            }

            if (currentMode === 'scroll') {
                if (toggleBtn) {
                    toggleBtn.innerText = '📄 보기 모드 : 자동 스크롤';
                    toggleBtn.classList.add('active');
                }
                if (scrollToolbar) scrollToolbar.style.display = 'flex'; 
                if (pageNavToolbar) pageNavToolbar.style.display = 'none';
                if (pageDisplay) pageDisplay.style.display = 'none';
                
                contentDiv.innerText = fullContentText;
            } else {
                if (toggleBtn) {
                    toggleBtn.innerText = '📄 보기 모드 : 페이지 전환모드';
                    toggleBtn.classList.remove('active');
                }
                if (scrollToolbar) scrollToolbar.style.display = 'none'; 
                if (pageNavToolbar) pageNavToolbar.style.display = 'flex';
                if (pageDisplay) pageDisplay.style.display = 'block';
                
                refreshView(true);
            }
            updateInfoBarOnly();
        }

        function toggleTheme() {
            const body = document.body;
            const btn = document.getElementById('themeToggleBtn');
            body.classList.toggle('dark-mode');
            if (body.classList.contains('dark-mode')) {
                btn.innerText = '☀️ 전환';
                localStorage.setItem('theme', 'dark');
            } else {
                btn.innerText = '🌙 전환';
                localStorage.setItem('theme', 'light');
            }
        }

        function openColorSearch() { window.open('https://www.google.com/search?q=%23fcfbf9&ie=UTF-8','_blank'); }

        function changeFont() {
            const fontSelect = document.getElementById('fontSelect');
            const selectedFont = fontSelect.value;
            document.body.style.fontFamily = selectedFont;
            localStorage.setItem('selectedFont', selectedFont);
            refreshView();
        }

        function clearCache() {
            if (confirm('저장된 모든 캐시(메모 목록)를 삭제하시겠습니까?')) {
                localStorage.removeItem('web_notes');
                notes = [];
                currentIndex = null;
                document.getElementById('titleInput').value = '';
                fullContentText = "";
                currentPageIndex = 0;
                document.getElementById('contentInput').innerText = '';
                stopAutoScroll();
                renderList();
                refreshView();
            }
        }

        function changeFileAccept() {
            const select = document.getElementById('fileExtensionFilter');
            const fileInput = document.getElementById('fileLoader');
            if (select.value === 'all') { fileInput.removeAttribute('accept'); }
            else { fileInput.setAttribute('accept', select.value); }
        }

        function openFileExplorer() { document.getElementById('fileLoader').click(); }

        function loadLocalFiles(event) {
            const files = event.target.files;
            if (!files.length) return;
            const fileCount = files.length;
            Array.from(files).forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const content = e.target.result;
                    let fileName = file.name;
                    let lastDotIndex = fileName.lastIndexOf('.');
                    let title = lastDotIndex !== -1 ? fileName.substring(0, lastDotIndex) : fileName;
                    notes.push({ title: title, content: content });
                    localStorage.setItem('web_notes', JSON.stringify(notes));
                    renderList();
                    if (index === 0) { selectNote(notes.length - fileCount); }
                };
                reader.readAsText(file, 'utf-8');
            });
            event.target.value = '';
        }

        function changeEditorHeight(amount) {
            const editor = document.getElementById('contentInput');
            if (!editor) return;
            let currentVh = parseInt(editor.style.height) || 55;
            let newVh = currentVh + amount;
            if (newVh < 30) newVh = 30;
            if (newVh > 90) newVh = 90;
            editor.style.height = newVh + 'vh';
            editor.style.minHeight = newVh + 'vh';
            refreshView();
        }

        function renderList() {
            const container = document.getElementById('itemContainer');
            if (!container) return;
            container.innerHTML = '';
            notes.forEach((note, index) => {
                const div = document.createElement('div');
                div.className = 'item';
                div.textContent = note.title || `제목없음 ${index + 1}`;
                div.onclick = () => selectNote(index);
                container.appendChild(div);
            });
        }

        function newItem() {
            currentIndex = null;
            document.getElementById('titleInput').value = '';
            fullContentText = "";
            currentPageIndex = 0;
            document.getElementById('contentInput').innerText = '';
            stopAutoScroll();
            if (currentMode === 'scroll') toggleViewMode();
            document.getElementById('titleInput').focus();
            refreshView();
        }

        function selectNote(index) {
            currentIndex = index;
            document.getElementById('titleInput').value = notes[index].title;
            fullContentText = notes[index].content || "";
            currentPageIndex = 0;
            stopAutoScroll();
            if (currentMode === 'scroll') {
                document.getElementById('contentInput').innerText = fullContentText;
            } else {
                refreshView();
            }
        }

        function handleEditorInput() {
            const contentDiv = document.getElementById('contentInput');
            if (currentMode === 'page') {
                let pages = splitTextIntoPages(fullContentText);
                if (pages.length === 0) pages = [""];
                pages[currentPageIndex] = contentDiv.innerText;
                fullContentText = pages.join("");
            } else {
                fullContentText = contentDiv.innerText;
            }
            updateInfoBarOnly();
        }

        function saveNote() {
            const title = document.getElementById('titleInput').value;
            const contentDiv = document.getElementById('contentInput');
            if (currentMode === 'page') {
                let pages = splitTextIntoPages(fullContentText);
                if (pages.length > 0) pages[currentPageIndex] = contentDiv.innerText;
                fullContentText = pages.join("");
            } else {
                fullContentText = contentDiv.innerText;
            }

            if (!title && !fullContentText.trim()) return alert('내용을 입력해주세요.');
            if (currentIndex === null) {
                notes.push({ title, content: fullContentText });
                currentIndex = notes.length - 1;
            } else {
                notes[currentIndex] = { title, content: fullContentText };
            }
            localStorage.setItem('web_notes', JSON.stringify(notes));
            renderList();
            alert('저장되었습니다!');
        }

        function downloadTxtFile() {
            const title = document.getElementById('titleInput').value.trim() || '제목없음';
            const contentDiv = document.getElementById('contentInput');
            if (currentMode === 'page') {
                let pages = splitTextIntoPages(fullContentText);
                if (pages.length > 0) pages[currentPageIndex] = contentDiv.innerText;
                fullContentText = pages.join("");
            } else {
                fullContentText = contentDiv.innerText;
            }

            if (!fullContentText.trim()) return alert('저장할 내용이 없습니다.');
            const blob = new Blob([fullContentText], { type: 'text/plain;charset=utf-8' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${title}.txt`;
            link.click();
            URL.revokeObjectURL(link.href);
        }

        function closeWindow() {
            if (confirm('메모장을 닫으시겠습니까?')) {
                window.close();
            }
        }

        function changeFontSize(step) {
            currentFontSize += step;
            if (currentFontSize < 10) currentFontSize = 10;
            if (currentFontSize > 36) currentFontSize = 36;
            
            applyFontSize();
            refreshView();
        }

        function resetFontSize() {
            currentFontSize = 16;
            applyFontSize();
            refreshView();
        }

        function applyFontSize() {
            const titleInput = document.getElementById('titleInput');
            const contentInput = document.getElementById('contentInput');
            
            if (titleInput) {
                titleInput.style.fontSize = currentFontSize + 'px';
            }
            if (contentInput) {
                contentInput.style.fontSize = currentFontSize + 'px';
                // 폰트가 커져도 부모 영역 밖으로 튀어나가지 않도록 강제 제한
                contentInput.style.boxSizing = 'border-box';
                contentInput.style.maxWidth = '100%';
            }
        }

        function splitTextIntoPages(text) {
            if (!text) return [""];
            const lines = text.split("\n");
            let pages = [];
            let currentChunk = "";
            let currentLineCount = 0;

            const contentDiv = document.getElementById('contentInput');
            const editorHeight = contentDiv ? (contentDiv.clientHeight || 300) : 300;
            const lineHeight = currentFontSize * 1.6;
            const maxLinesPerPage = Math.max(5, Math.floor((editorHeight - 32) / lineHeight));

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const estimatedSubLines = Math.max(1, Math.ceil(line.length / 45));

                if (currentLineCount + estimatedSubLines > maxLinesPerPage && currentChunk !== "") {
                    pages.push(currentChunk);
                    currentChunk = line + (i < lines.length - 1 ? "\n" : "");
                    currentLineCount = estimatedSubLines;
                } else {
                    currentChunk += line + (i < lines.length - 1 ? "\n" : "");
                    currentLineCount += estimatedSubLines;
                }
            }

            if (currentChunk !== "") {
                pages.push(currentChunk);
            }

            return pages.length > 0 ? pages : [""];
        }

        function refreshView(updateBoxText = true) {
            if (currentMode !== 'page') return;

            const contentDiv = document.getElementById('contentInput');
            const pages = splitTextIntoPages(fullContentText);
            
            if (currentPageIndex >= pages.length) {
                currentPageIndex = Math.max(0, pages.length - 1);
            }

            if (updateBoxText && contentDiv) {
                contentDiv.innerText = pages[currentPageIndex] || "";
            }

            updateInfoBarOnly();
        }

        function updateInfoBarOnly() {
            const pages = splitTextIntoPages(fullContentText);
            const charCount = fullContentText.length;
            const charWithoutSpaces = fullContentText.replace(/\s/g, '').length;
            const totalPages = pages.length;

            const charCountEl = document.getElementById('charCount');
            const linePageInfoEl = document.getElementById('linePageInfo');
            const currentPageDisplayEl = document.getElementById('currentPageDisplay');

            if (charCountEl) charCountEl.innerText = `글자수: ${charCount}자 (공백 제외 ${charWithoutSpaces}자)`;
            if (linePageInfoEl) linePageInfoEl.innerText = `총 페이지: ${totalPages}페이지`;
            if (currentMode === 'page' && currentPageDisplayEl) {
                currentPageDisplayEl.innerText = `${currentPageIndex + 1} 페이지`;
            }
        }

        function navigateContentPage(direction) {
            if (currentMode !== 'page') return;

            const contentDiv = document.getElementById('contentInput');
            let pages = splitTextIntoPages(fullContentText);
            if (pages.length > 0) pages[currentPageIndex] = contentDiv.innerText;
            fullContentText = pages.join("");

            pages = splitTextIntoPages(fullContentText);
            const totalPages = pages.length;

            let targetPage = currentPageIndex + direction;
            if (targetPage < 0 || targetPage >= totalPages) return;

            const effectClass = direction > 0 ? 'page-content-next' : 'page-content-prev';
            if (contentDiv) contentDiv.classList.add(effectClass);

            setTimeout(() => {
                currentPageIndex = targetPage;
                refreshView(true);
                if (contentDiv) {
                    contentDiv.classList.remove(effectClass);
                    contentDiv.scrollTop = 0; 
                }
            }, 350);
        }

        function toggleAutoScrollPlay() {
            if (isAutoScrolling) {
                stopAutoScroll();
            } else {
                startAutoScroll();
            }
        }

        function startAutoScroll() {
            const contentDiv = document.getElementById('contentInput');
            if (!contentDiv) return;
            
            fullContentText = contentDiv.innerText;

            if (!fullContentText.trim()) {
                //alert('스크롤할 내용이 없습니다.');
                return;
            }

            if (contentDiv.scrollHeight <= contentDiv.clientHeight) {
                alert('내용이 화면 안에 모두 들어와서 스크롤할 필요가 없습니다.');
                return;
            }

            isAutoScrolling = true;
            const scrollToggleBtn = document.getElementById('scrollToggleBtn');
            const scrollStatusText = document.getElementById('scrollStatusText');
            if (scrollToggleBtn) scrollToggleBtn.innerText = '⏸ 일시정지';
            if (scrollStatusText) scrollStatusText.innerText = '자동 스크롤: 재생 중';

            const intervalTime = 20;

            autoScrollInterval = setInterval(() => {
                if (contentDiv.scrollTop + contentDiv.clientHeight >= contentDiv.scrollHeight - 2) {
                    stopAutoScroll();
                    return;
                }
                
                let moveStep = 0.6 * currentScrollSpeed;
                contentDiv.scrollTop += moveStep;
                
            }, intervalTime);
        }

        function stopAutoScroll() {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
            isAutoScrolling = false;
            const btn = document.getElementById('scrollToggleBtn');
            const status = document.getElementById('scrollStatusText');
            if (btn) btn.innerText = '▶ 시작';
            if (status) status.innerText = '자동 스크롤: 정지됨';
        }
	
        function updateScrollSpeed(val) {
            currentScrollSpeed = parseFloat(val);
            const speedDisplay = document.getElementById('speedDisplay');
            if (speedDisplay) {
                speedDisplay.innerText = currentScrollSpeed.toFixed(2) + 'x';
            }
        }

        if (contentInput) {
            contentInput.addEventListener('mousedown', () => {
                if (isAutoScrolling) stopAutoScroll();
            });
        }

        renderList();
