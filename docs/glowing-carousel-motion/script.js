const carousel = document.getElementById("carousel");
const cards = carousel.querySelectorAll(".card");
let currentCardIndex = 0;
const totalCards = cards.length;
let rotationInterval = null;
let isPopupOpen = false;

// Dynamische stappen en afstand op basis van scherm
function getResponsiveSettings() {
  const width = window.innerWidth;

  if (width <= 400) return { rotationStep: 45, radius: 160 }; // Zeer compact
  if (width <= 600) return { rotationStep: 50, radius: 200 }; // Mobiel
  if (width <= 768) return { rotationStep: 60, radius: 260 }; // Tablet
  return { rotationStep: 72, radius: 350 }; // Desktop
}

function setCardPositions() {
  const { rotationStep, radius } = getResponsiveSettings();
  cards.forEach((card, i) => {
    const rotateY = i * rotationStep;
    const angleRad = (rotateY * Math.PI) / 180;
    const x = Math.sin(angleRad) * radius;
    const z = Math.cos(angleRad) * radius;
    card.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotateY}deg)`;
  });
  rotateCarousel(); // herbereken rotatiehoek bij aanpassing
  updateCardSize();
}


function updateCardSize() {
  cards.forEach((card, i) => {
    
	// 3초(3000ms)마다 자동으로 nextCard 함수를 실행하여 무한 롤링
	setInterval(nextCard, 500);

	// 페이지 로드 시 첫 번째 카드 먼저 활성화
	updateCardSize();

	if (i === currentCardIndex) {
      card.style.transform += " scale(1.2)";
      card.style.zIndex = "1";
    } else {
      card.style.transform = card.style.transform.replace(" scale(1.2)", "");
      card.style.zIndex = "0";
    }
  });
}


/************************************************************************************/
/*
function updateCardSize() {
  cards.forEach((card, i) => {
    if (i === currentCardIndex) {
      // +=를 쓰면 함수가 반복 실행될 때 scale(1.2)이 계속 뒤에 붙을 수 있으므로
      // 기존 transform에 scale을 깔끔하게 더해줍니다.
      card.style.transform = "scale(1.2)"; 
      card.style.zIndex = "1";
    } else {
      card.style.transform = "scale(1)"; // 기본 크기로 명시적 변환
      card.style.zIndex = "0";
    }
  });
}

// 🔄 다음 카드로 이동하며 '계속 롤링'하게 만드는 함수
function nextCard() {
  // 인덱스를 1 증가시키고, 총 개수로 나눈 나머지를 구합니다.
  // 예: 카드가 3장일 때 (0+1)%3 = 1, (1+1)%3 = 2, (2+1)%3 = 0 (다시 처음으로!)
  currentCardIndex = (currentCardIndex + 1) % totalCards;
  
  updateCardSize();
}

// 🔄 이전 카드로 이동 (역방향 롤링이 필요할 때)
function prevCard() {
  // 음수가 되는 것을 방지하기 위해 totalCards를 더한 후 나머지 연산을 합니다.
  currentCardIndex = (currentCardIndex - 1 + totalCards) % totalCards;
  
  updateCardSize();
}

/************************************************************************************/

function rotateCarousel() {
  const { rotationStep } = getResponsiveSettings();
  const rotateDeg = -rotationStep * currentCardIndex;
  carousel.style.transform = `rotateY(${rotateDeg}deg)`;
}

function startRotation() {
  if (rotationInterval || isPopupOpen) return;
  rotationInterval = setInterval(() => {
    currentCardIndex = (currentCardIndex + 1) % totalCards;
    setCardPositions();
  }, 1400);
}

function stopRotation() {
  if (rotationInterval) {
    clearInterval(rotationInterval);
    rotationInterval = null;
  }
}

carousel.addEventListener("mouseover", () => {
  if (!isPopupOpen) stopRotation();
});

carousel.addEventListener("mouseout", () => {
  if (!isPopupOpen) startRotation();
});

carousel.addEventListener("touchstart", () => {
  if (!isPopupOpen) stopRotation();
});

carousel.addEventListener("touchend", () => {
  if (!isPopupOpen) startRotation();
});

function showPopup(cardId) {
  const popup = document.getElementById(`popup-${cardId}`);
  if (popup) {
    popup.classList.add("show");
    isPopupOpen = true;
    stopRotation();
  }
}

function closePopup() {
  document.querySelectorAll(".popup").forEach((popup) => {
    popup.classList.remove("show");
  });
  isPopupOpen = false;
  startRotation();
}

cards.forEach((card) => {
  card.addEventListener("click", () => {
    const cardId = card.dataset.id;
    showPopup(cardId);
  });
});

// Init + resize support
setCardPositions();
startRotation();

window.addEventListener("resize", () => {
  setCardPositions(); // opnieuw positioneren bij vensterverandering
});