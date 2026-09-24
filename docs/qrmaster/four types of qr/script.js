// ITL CODE - script.js
// Requires: qr-code-styling, JsBarcode, bwip-js (loaded in HTML)

const codeTypeEl = document.getElementById('codeType');
const platformEl = document.getElementById('platform');
const dataInputEl = document.getElementById('dataInput');
const primaryColorEl = document.getElementById('primaryColor');
const bgColorEl = document.getElementById('bgColor');
const qrStyleEl = document.getElementById('qrStyle');
const logoFileEl = document.getElementById('logoFile');

const generateBtn = document.getElementById('generateBtn');
const downloadBtn = document.getElementById('downloadBtn');
const clearBtn = document.getElementById('clearBtn');

const previewArea = document.getElementById('previewArea');
const qrStyleWrap = document.getElementById('qrStyleWrap');

// 모달 엘리먼트 가져오기
const downloadModal = document.getElementById('downloadModal');
const modalFileName = document.getElementById('modalFileName');
const modalImageSize = document.getElementById('modalImageSize');
const modalBottomText = document.getElementById('modalBottomText');
const modalFileExt = document.getElementById('modalFileExt');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalConfirmBtn = document.getElementById('modalConfirmBtn');

// 라디오 버튼 및 입력창 엘리먼트 가져오기
const radioModes = document.querySelectorAll('input[name="qrTypeMode"]');
const singleInputLabel = document.getElementById('singleInputLabel');
const smsInputsContainer = document.getElementById('smsInputsContainer');
const smsPhoneEl = document.getElementById('smsPhone');
const smsMessageEl = document.getElementById('smsMessage');

let qrCodeInstance = null;
let lastGenerated = { type: null, blobUrl: null, canvasRef: null, svgEl: null };

// 라디오 선택 변경 시 UI 전환 및 placeholder 변경 이벤트
radioModes.forEach((radio) => {
  radio.addEventListener('change', (e) => {
    const mode = e.target.value;
    
    if (mode === 'sms') {
      if (singleInputLabel) singleInputLabel.style.display = 'none';
      if (smsInputsContainer) smsInputsContainer.style.display = 'block';
    } else {
      if (singleInputLabel) singleInputLabel.style.display = 'block';
      if (smsInputsContainer) smsInputsContainer.style.display = 'none';

      if (singleInputLabel) {
        if (mode === 'url') {
          singleInputLabel.childNodes[0].textContent = '웹주소 입력: ';
          if (dataInputEl) dataInputEl.placeholder = '웹주소를 입력하세요 (예: example.com 또는 https://...)';
        } else if (mode === 'text') {
          singleInputLabel.childNodes[0].textContent = '텍스트 입력: ';
          if (dataInputEl) dataInputEl.placeholder = '일반 텍스트 내용을 입력하세요.';
        } else if (mode === 'tel') {
          singleInputLabel.childNodes[0].textContent = '전화번호 입력: ';
          if (dataInputEl) dataInputEl.placeholder = '전화번호를 입력하세요 (예: 010-1234-5678)';
        }
      }
    }
  });
});

// 선택한 모드에 맞게 데이터 문자열 조합 및 표준 규격 변환
function buildDataString() {
  const selectedMode = document.querySelector('input[name="qrTypeMode"]:checked').value;

  if (selectedMode === 'sms') {
    const phone = (smsPhoneEl.value || '').trim();
    const msg = (smsMessageEl.value || '').trim();
    if (!phone) return '';
    return `SMSTO:${phone}:${msg}`;
  } 
  
  let val = (dataInputEl.value || '').trim();
  if (!val) return '';

  if (selectedMode === 'url') {
    if (!val.startsWith('http://') && !val.startsWith('https://')) {
      return 'https://' + val;
    }
    return val;
  } else if (selectedMode === 'tel') {
    return 'tel:' + val;
  } else {
    return val;
  }
}

// 미리보기 초기화
function clearPreview() {
  previewArea.innerHTML = '';
  downloadBtn.disabled = true;
  lastGenerated = { type: null, blobUrl: null, canvasRef: null, svgEl: null };
}

// 코드 타입에 따른 옵션 표시/숨김
function updateUIByType() {
  const t = codeTypeEl.value;
  if (t === 'qr') {
    qrStyleWrap.style.display = 'block';
    logoFileEl.parentElement.style.display = 'block';
  } else {
    qrStyleWrap.style.display = 'none';
    logoFileEl.parentElement.style.display = 'none';
  }
}

codeTypeEl.addEventListener('change', updateUIByType);
updateUIByType();

// 로고 파일 읽기
function readLogoFile(file) {
  return new Promise((res, rej) => {
    if (!file) return res(null);
    const reader = new FileReader();
    reader.onload = () => res(reader.result);
    reader.onerror = (e) => rej(e);
    reader.readAsDataURL(file);
  });
}

// 코드 생성 메인 함수
async function generateCode() {
  const type = codeTypeEl.value;
  const data = buildDataString();

  if (!data) {
    alert('데이터를 입력하거나 필수 항목을 채워주세요!');
    return;
  }

  clearPreview();

  if (type === 'qr') {
    const logoFile = logoFileEl.files[0];
    const logoData = await readLogoFile(logoFile);
    
    qrCodeInstance = new QRCodeStyling({
      width: 420,
      height: 420,
      type: 'canvas',
      data: unescape(encodeURIComponent(data)),
      image: logoData || '',
      dotsOptions: {
        color: primaryColorEl.value,
        type: qrStyleEl.value
      },
      backgroundOptions: {
        color: bgColorEl.value
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: 12,
        imageSize: 0.2
      }
    });

    qrCodeInstance.append(previewArea);
    downloadBtn.disabled = false;
    lastGenerated.type = 'qr';
    lastGenerated.qrInstance = qrCodeInstance;

  } else if (type === 'code128' || type === 'ean13' || type === 'upc') {
    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute('id', 'barcode-svg');
    svg.setAttribute('width', '480');
    svg.setAttribute('height', '160');

    try {
      JsBarcode(svg, data, {
        format: (type === 'code128' ? 'CODE128' : (type === 'ean13' ? 'EAN13' : 'UPC')),
        lineColor: primaryColorEl.value,
        background: bgColorEl.value,
        width: 2,
        height: 90,
        displayValue: true,
        margin: 10
      });
      previewArea.appendChild(svg);
      downloadBtn.disabled = false;
      lastGenerated.type = 'svg';
      lastGenerated.svgEl = svg;
    } catch (err) {
      alert('바코드 생성 실패: ' + err.message);
      clearPreview();
    }

  } else if (type === 'pdf417' || type === 'datamatrix' || type === 'aztec') {
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    previewArea.appendChild(canvas);

    let bcid = '';
    if (type === 'pdf417') bcid = 'pdf417';
    if (type === 'datamatrix') bcid = 'datamatrix';
    if (type === 'aztec') bcid = 'azteccode';

    try {
      bwipjs.toCanvas(canvas, {
        bcid: bcid,
        text: data,
        scale: 3,
        backgroundcolor: bgColorEl.value.replace('#',''),
        fillcolor: primaryColorEl.value.replace('#',''),
      });
      downloadBtn.disabled = false;
      lastGenerated.type = 'canvas';
      lastGenerated.canvasRef = canvas;
    } catch (e) {
      alert('코드 렌더링 실패: ' + e);
      clearPreview();
    }

  } else {
    alert('지원하지 않는 형식입니다: ' + type);
  }
}

// --- 다운로드 모달 및 변환 로직 ---

// 1. 다운로드 버튼 클릭 시 모달 띄우기
downloadBtn.addEventListener('click', () => {
  if (!lastGenerated.type) return;
  modalFileName.value = ''; 
  modalImageSize.value = '250'; 
  modalBottomText.value = '나를 스캔해 주세요';
  modalFileExt.value = 'jpg'; 
  downloadModal.style.display = 'flex';
});

// 모달 취소 버튼
modalCancelBtn.addEventListener('click', () => {
  downloadModal.style.display = 'none';
});

// 모달 바깥 배경 클릭 시 닫기
downloadModal.addEventListener('click', (e) => {
  if (e.target === downloadModal) {
    downloadModal.style.display = 'none';
  }
});

// 2. 모달 내 '다운로드' 버튼 클릭 시 실행
modalConfirmBtn.addEventListener('click', async () => {
  downloadModal.style.display = 'none';

  let customName = modalFileName.value.trim();
  const ext = modalFileExt.value;
  const targetSize = parseInt(modalImageSize.value) || 250;
  const selectedText = modalBottomText.value; // 모달에서 선택한 문구 정확히 수신

  if (!customName) {
    customName = '_qr_code';
  }
  const filename = `${customName}.${ext}`;

  const type = lastGenerated.type;
  const data = buildDataString();

  if (type === 'svg' && lastGenerated.svgEl) {
    processSvgAndDownloadWithResize(lastGenerated.svgEl, filename, ext, targetSize, selectedText);
    return;
  }

  renderAndDownloadWithSize(type, data, filename, ext, targetSize, selectedText);
});

// 크기, 패딩, 둥근 모서리 테두리, 그리고 사용자가 선택한 하단 문구를 반영하여 다운로드하는 함수
async function renderAndDownloadWithSize(type, data, filename, ext, size, bottomText) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = size;
  tempCanvas.height = size;
  const ctx = tempCanvas.getContext('2d');

  // 전체 배경 색상 채우기
  ctx.fillStyle = bgColorEl.value || '#ffffff';
  ctx.fillRect(0, 0, size, size);

  if (type === 'qr') {
    const hasText = bottomText && bottomText.trim() !== ''; 
    const textHeight = hasText ? Math.max(24, Math.round(size * 0.08)) : 0;
    const padding = 15;
    const qrDrawSize = size - (padding * 2) - textHeight;

    const logoFile = logoFileEl.files[0];
    const logoData = await readLogoFile(logoFile);

    const tempQr = new QRCodeStyling({
      width: qrDrawSize,
      height: qrDrawSize,
      type: 'canvas',
      data: unescape(encodeURIComponent(data)),
      image: logoData || '',
      dotsOptions: {
        color: primaryColorEl.value,
        type: qrStyleEl.value
      },
      backgroundOptions: {
        color: bgColorEl.value
      },
      imageOptions: {
        crossOrigin: 'anonymous',
        margin: Math.round(qrDrawSize * 0.03),
        imageSize: 0.2
      }
    });

    const tempDiv = document.createElement('div');
    tempQr.append(tempDiv);
    
    setTimeout(() => {
      const canvasEl = tempDiv.querySelector('canvas');
      if (canvasEl) {
        ctx.save();
        
        // 둥근 모서리 사각형 테두리 그리기
        const radius = Math.min(20, size * 0.05);
        ctx.beginPath();
        ctx.roundRect(5, 5, size - 10, size - 10, radius);
        ctx.strokeStyle = primaryColorEl.value || '#000000';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.restore();

        // 캔버스 가로 중앙에 정확히 오도록 X좌표 계산
        const drawX = (size - qrDrawSize) / 2;
        const drawY = padding; 

        // 내부 QR 코드 이미지 정중앙에 그리기
        ctx.drawImage(canvasEl, drawX, drawY, qrDrawSize, qrDrawSize);

        // 사용자가 선택한 하단 텍스트 출력 (없음 선택 시 출력 안 함)
        if (hasText) {
          ctx.save();
          const fontSize = Math.max(12, Math.round(size * 0.04));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = primaryColorEl.value || '#000000';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          const textX = size / 2;
          const textY = size - padding - (textHeight / 2);
          ctx.fillText(bottomText, textX, textY);
          ctx.restore();
        }

        finalizeDownload(tempCanvas, filename, ext);
      } else {
        alert('QR 이미지 생성 중 오류가 발생했습니다.');
      }
    }, 100);

  } else if (type === 'canvas') {
    const originalCanvas = previewArea.querySelector('canvas');
    if (originalCanvas) {
      const drawX = (size - (size - 20)) / 2;
      ctx.drawImage(originalCanvas, drawX, 10, size - 20, size - 20);
      finalizeDownload(tempCanvas, filename, ext);
    }
  }
}

// SVG 바코드 크기 조절 및 테두리 다운로드
function processSvgAndDownloadWithResize(svg, filename, ext, size, bottomText) {
  const serializer = new XMLSerializer();
  const svgStr = serializer.serializeToString(svg);
  const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = bgColorEl.value || '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const hRatio = (size - 30) / img.width;
    const vRatio = (size - 30) / img.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShiftX = (size - img.width * ratio) / 2;
    const centerShiftY = (size - img.height * ratio) / 2;

    ctx.drawImage(img, 0, 0, img.width, img.height, centerShiftX, centerShiftY, img.width * ratio, img.height * ratio);

    finalizeDownload(canvas, filename, ext);
    URL.revokeObjectURL(url);
  };
  img.onerror = () => {
    alert('이미지 변환 실패');
    URL.revokeObjectURL(url);
  };
  img.src = url;
}

// 최종 파일 타입별 다운로드 처리
function finalizeDownload(canvas, filename, ext) {
  if (ext === 'svg') {
    const dataUrl = canvas.toDataURL('image/png');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${dataUrl}" width="100%" height="100%"/></svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    triggerDownloadFromDataURL(url, filename);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }

  let mimeType = 'image/png';
  if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
  else if (ext === 'bmp') mimeType = 'image/bmp';
  else if (ext === 'gif') mimeType = 'image/gif';

  const dataUrl = canvas.toDataURL(mimeType, 0.9);
  triggerDownloadFromDataURL(dataUrl, filename);
}

function triggerDownloadFromDataURL(dataUrl, filename) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

// 이벤트 리스너 등록
generateBtn.addEventListener('click', async () => {
  await generateCode();
});

const observer = new MutationObserver(() => {
  if (previewArea.children.length > 0) {
    downloadBtn.disabled = false;
  } else {
    downloadBtn.disabled = true;
  }
});
observer.observe(previewArea, { childList: true });

clearBtn.addEventListener('click', clearPreview);