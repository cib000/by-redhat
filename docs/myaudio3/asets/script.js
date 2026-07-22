console.clear();

// iOS 볼륨 조절 지원 여부 감지
var supportsVolumeControl = (function (window, document) {
  'use strict';
  var audio = document.createElement('audio');
  audio.volume = 0.01;
  document.body.appendChild(audio);

  audio.addEventListener('volumechange', _ =>
     audio.volume === 0.01 &&
     document.documentElement.classList.add("-js-supportsVolumeControl")
  , {once: true});

  document.body.removeChild(audio);
}(window, document));

// Vue 인스턴스 생성
const app = new Vue({
  el: '#player',
  data() {
    return {
      audio: null,
      barWidth: 0,
      duration: '00:00',
      currentTime: '00:00', // MP3 재생 시간용 변수 (건드리지 않음)
      clockText: '',        // 🔥 [추가] 실시간 시계 전용 변수
      isTimerPlaying: false,
      isMuted: false,
      volume: 0.5, // 초기 볼륨 50%
     
      showListModal: false,
      isFullScreen: false,
	  
      // 초기 안내용 트랙
      tracks: [
        {
          title: '상단의 버튼을 눌러 MP3 폴더를 선택하세요',
          source: ''
        }
      ],
      currentTrack: {
        title: '상단의 버튼을 눌러 MP3 폴더를 선택하세요',
        source: ''
      },
      currentTrackIndex: 0,
      transitionName: null
    };
  },

  computed: {
    supportsVolume() {
      return true;
    }
  },

  methods: {
    prefetch() {},
	
    playTrack() {
      if (!this.audio || !this.audio.src) return;
      if (this.audio.paused) {
        this.audio.play();
        this.isTimerPlaying = true;
      } else {
        this.audio.pause();
        this.isTimerPlaying = false;
      }
    },

    muteTrack() {
      if (!this.supportsVolume) return;
      this.isMuted = !this.isMuted;
      this.audio.volume = this.isMuted ? 0 : this.volume;
    },

    volRange() {
      if (!this.supportsVolume) return;
      const volRange = this.$refs.volRange;
      if (!volRange) return;
      const vol = volRange.value;
      this.volume = vol / 100;
      if (!this.isMuted) {
        this.audio.volume = this.volume;
      }
    },

    generateTime() {
      if (!this.audio.duration || isNaN(this.audio.duration)) return;
      let width = (100 / this.audio.duration) * this.audio.currentTime;
      this.barWidth = ~~width;

      let durmin = Math.floor(this.audio.duration / 60);
      let dursec = Math.floor(this.audio.duration % 60);
      let curmin = Math.floor(this.audio.currentTime / 60);
      let cursec = Math.floor(this.audio.currentTime % 60);

      this.currentTime = `${curmin.toString().padStart(2, '0')}:${cursec.toString().padStart(2, '0')}`;
      this.duration = `${durmin.toString().padStart(2, '0')}:${dursec.toString().padStart(2, '0')}`;
    },

    updateBar(e) {
      if (!this.audio || !this.audio.duration) return;
      const rect = e.target.getBoundingClientRect();
      const position = e.clientX - rect.left;

      let percentage = (100 * position) / this.$refs.progress.offsetWidth;
      percentage = Math.max(0, Math.min(100, percentage));

      this.barWidth = ~~percentage;
      this.audio.currentTime = (this.audio.duration * percentage) / 100;
    },

    progressTrack(e) {
      this.updateBar(e);
      if (this.isTimerPlaying) {
        this.audio.play();
      }
    },

    setTrack() {
      this.currentTrack = this.tracks[this.currentTrackIndex];
      this.resetPlayer();
    },

    prevTrack() {
      if (this.tracks.length === 0) return;
      this.transitionName = 'fadeCard-prev';
      if (--this.currentTrackIndex < 0) {
        this.currentTrackIndex = this.tracks.length - 1;
      }
      this.setTrack();
    },

    nextTrack() {
      if (this.tracks.length === 0) return;
      this.transitionName = 'fadeCard-next';
      if (++this.currentTrackIndex >= this.tracks.length) {
        this.currentTrackIndex = 0;
      }
      this.setTrack();
    },

    resetPlayer() {
      this.barWidth = 0;
      this.currentTime = '00:00';
      this.audio.currentTime = 0;
      this.audio.src = this.currentTrack.source;
      this.audio.volume = this.isMuted ? 0 : this.volume;

      if (this.isTimerPlaying) {
        this.audio.play();
      }
    },

    // 로컬 폴더 파일 처리 메서드
    loadLocalFiles(files) {
      const subCheckbox = document.getElementById('includeSubfolders');
      const includeSubfolders = subCheckbox ? subCheckbox.checked : true;
      const loadedTracks = [];

      for (let file of files) {
        if (!file.name.toLowerCase().endsWith('.mp3')) continue;

        const relativePath = file.webkitRelativePath;
        const pathParts = relativePath.split('/');

        if (!includeSubfolders && pathParts.length > 2) {
          continue;
        }

        const blobUrl = URL.createObjectURL(file);
        const title = file.name.replace(/\.mp3$/i, '');

        loadedTracks.push({
          title: title,
          source: blobUrl
        });
      }

      if (loadedTracks.length === 0) {
        alert('선택한 조건에 해당하는 MP3 파일이 없습니다.');
        return;
      }

      this.tracks = loadedTracks;
      this.currentTrackIndex = 0;
      this.currentTrack = this.tracks[0];
      this.isTimerPlaying = false;
      this.resetPlayer();
    },

    // 전체화면 토글 기능
    toggleFullScreen() {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().then(() => {
          this.isFullScreen = true;
        }).catch(() => {});
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().then(() => {
            this.isFullScreen = false;
          });
        }
      }
    },

    // 목록 모달에서 곡 클릭 시 재생
    selectTrack(index) {
      if (!this.tracks[index] || !this.tracks[index].source) return;
      this.currentTrackIndex = index;
      this.setTrack();
      this.isTimerPlaying = true;
      this.audio.play();
      this.showListModal = false;
    },

    // 🔥 [추가] 실시간 시계 업데이트 함수 (clockText 변수 사용)
    updateClock() {
      const now = new Date();
      
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      
      const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
      const day = weekNames[now.getDay()];
      
      let hours = now.getHours();
      const ampm = hours >= 12 ? '오후' : '오전';
      hours = hours % 12;
      hours = hours ? hours : 12;
      
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      this.clockText = `${year}년 ${month}월 ${date}일 ${day} ${ampm} ${hours}시 ${minutes}분`;
    }
  },

  created() {
    this.audio = new Audio();
    this.audio.ontimeupdate = () => this.generateTime();
    this.audio.onloadedmetadata = () => this.generateTime();
    this.audio.onended = () => {
      this.nextTrack();
      this.isTimerPlaying = true;
    };
  },

  // 🔥 [추가] Vue 화면 생성 직후 시계 구동
  mounted() {
    this.updateClock();
    setInterval(this.updateClock, 1000);
  }
});

// 폴더 선택 이벤트 연결
const folderInput = document.getElementById('folderInput');
if (folderInput) {
  folderInput.addEventListener('change', function (e) {
    app.loadLocalFiles(e.target.files);
  });
}

/********************************************************************************/

// 독립형 실시간 시계 함수
function initRealtimeClock() {
  const clockEl = document.getElementById('current-clock');
  if (!clockEl) return;

  function renderClock() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    
    const weekNames = ['일', '월', '화', '수', '목', '금', '토'];
    const day = weekNames[now.getDay()];
    
    let hours = now.getHours();
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12 || 12;
    
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    clockEl.textContent = `${year}년 ${month}월 ${date}일 ${day} ${ampm} ${hours}시 ${minutes}분`;
  }

  renderClock();
  setInterval(renderClock, 1000);
}

// DOM 로드 완료 후 실행
document.addEventListener('DOMContentLoaded', initRealtimeClock);


