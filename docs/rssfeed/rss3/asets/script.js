/*
$(document).ready(function () {
    let rssList = [
        { name: "연합뉴스", url: "http://www.yonhapnewstv.co.kr/browse/feed/" },
        { name: "JTBC 뉴스룸", url: "https://news-ex.jtbc.co.kr/v1/get/rss/program/NG10000002" }
    ];

    // 기존 자동 읽기 이벤트 제거 → 이제 버튼으로만 동작

    // "확인" 버튼 클릭 시 파일 읽기
    $('.btnsubmit').on('click', function () {
        const fileInput = $('#fileInput')[0];  // DOM 요소 가져오기
        const file = fileInput.files[0];

        if (!file) {
            alert('먼저 .txt 파일을 선택해 주세요!');
            return;
        }

        // 파일 확장자 체크 (안전하게)
        if (!file.name.toLowerCase().endsWith('.txt')) {
            alert('텍스트 파일(.txt)만 업로드 가능합니다.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            parseAndAddRssList(content);  // 기존 파싱 함수 호출
        };
        reader.onerror = function () {
            alert('파일을 읽는 중 오류가 발생했습니다.');
        };
        reader.readAsText(file, 'UTF-8');
    });

    // parseAndAddRssList 함수는 기존 그대로 사용 (중복 방지 포함)
    function parseAndAddRssList(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line && line.includes(','));

        // 기존 사용자 추가 옵션 제거 (중복 방지)
        $('#rssSelect option.user-added').remove();

        let addedCount = 0;
        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                let name = parts[0].trim();
                let url = parts[1].trim();

                if (!url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }

                // 중복 체크
                const exists = rssList.some(item => item.url === url);
                if (!exists) {
                    rssList.push({ name: name, url: url });
                    $('#rssSelect').append(
                        `<option class="user-added" value="${url}">${name}</option>`
                    );
                    addedCount++;
                }
            }
        });

        if (addedCount > 0) {
            alert(`성공적으로 ${addedCount}개의 RSS 소스를 추가했습니다!`);
            // 첫 번째 사용자 추가 항목 자동 선택 (선택 사항)
            // $('#rssSelect').val($('#rssSelect option.user-added').first().val()).trigger('change');
        } else {
            alert('추가된 새로운 RSS 소스가 없습니다. (중복 또는 형식 오류)');
        }
    }

    // 나머지 코드는 그대로: loadFeed, change 이벤트 등
    // ...
});
*/
/******************************************************************************************/


$(document).ready(function () {
    let rssList = [
        { name: "연합뉴스", url: "http://www.yonhapnewstv.co.kr/browse/feed/" },
        { name: "JTBC 뉴스룸", url: "https://news-ex.jtbc.co.kr/v1/get/rss/program/NG10000002" }
        // 기본 제공 목록
    ];

    // 기본 피드 로드 (선택된 게 없으면 첫 번째 기본값)
    function loadFeed(url, title = "선택된 뉴스") {
        if (!url) return;

        $('#current-feed').empty(); // 기존 피드 지우기
        $('#rss-title a').text(title).attr('href', '');

        $('#current-feed').FeedEk({
            FeedUrl: url,
            MaxCount: 100,
            //DateFormat: 'YYYY-MM-DD',
            ShowDesc: true,
            ShowPubDate: true,
            DescCharacterLimit: 350,
            TitleLinkTarget: '_blank'
        });
    }

    // 선택상자 변경 시 피드 로드
    $('#rssSelect').on('change', function () {
        const selectedUrl = $(this).val();
        const selectedText = $(this).find('option:selected').text();

        if (selectedUrl) {
            $('#rssResult').val(selectedUrl); // 입력창에 주소 표시
            loadFeed(selectedUrl, selectedText);
        }
    });

    // 파일 업로드 처리 (.txt 파일)
    $('#fileInput').on('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (event) {
            const content = event.target.result;
            parseAndAddRssList(content);
        };
        reader.readAsText(file, 'UTF-8');
    });

/******************************************************************************************/
    // 텍스트 파일 파싱해서 select에 옵션 추가
    function parseAndAddRssList(text) {
        const lines = text.split('\n').map(line => line.trim()).filter(line => line && line.includes(','));

        // 기존 사용자 추가 옵션 제거 (중복 방지)
        $('#rssSelect option.user-added').remove();

        lines.forEach(line => {
            const parts = line.split(',');
            if (parts.length >= 2) {
                let name = parts[0].trim();
                let url = parts[1].trim();

                // https가 아니면 http 추가 (필요시)
                if (!url.match(/^https?:\/\//i)) {
                    url = 'https://' + url;
                }

                // 중복 체크
                const exists = rssList.some(item => item.url === url);
                if (!exists) {
                    rssList.push({ name: name, url: url });

                    // select에 추가
                    $('#rssSelect').append(
                        `<option class="user-added" value="${url}">${name}</option>`
                    );
                }
            }
        });

        //alert('사용자 RSS 목록을 성공적으로 불러왔습니다!');
    }

/******************************************************************************************/

	// 선택한 피드 로드 함수 (수정된 버전)
	function loadFeed(url, title, homepageUrl = null) {
		if (!url) return;

    // 1. 로딩 스피너 보이기
    $('#loading-spinner').show();
    $('#current-feed').children().not('#loading-spinner').hide(); // 기존 콘텐츠 숨기기

/*
    // 제목 업데이트 (로딩 중에도 보이게)
    const titleText = title ? `뉴스모아보기 - ${title}` : '뉴스모아보기';
    $('#feed-link').text(titleText);

    if (homepageUrl && homepageUrl !== '#') {
        $('#feed-link').attr('href', homepageUrl);
    } else {
        try {
            const domain = new URL(url).origin;
            $('#feed-link').attr('href', domain);
        } catch (e) {
            $('#feed-link').attr('href', '#');
        }
    }
*/

//		$('#current-feed').empty(); // 기존 피드 지우기

		// 제목 표시
		const titleText = title ? `${title} - 뉴스모아보기 ` : '뉴스모아보기';
		$('#feed-link').text(titleText);

		// 홈페이지 링크가 있으면 적용, 없으면 # 또는 RSS 제공 사이트 기본 링크
		if (homepageUrl && homepageUrl !== '#') {
			$('#feed-link').attr('href', homepageUrl);
		} else {
			// 홈페이지 URL이 없을 때는 일단 RSS의 도메인으로 유추하거나 #으로 둠
			try {
				const domain = new URL(url).origin;
				$('#feed-link').attr('href', domain);
			} catch (e) {
				$('#feed-link').attr('href', '#');
			}
		}

/*
		// 피드 로드
		$('#current-feed').FeedEk({
			FeedUrl: url,
			MaxCount: 40,
			// DateFormat: 'YYYY-MM-DD',
			ShowDesc: true,
			ShowPubDate: true,
			// DescCharacterLimit: 150,
			TitleLinkTarget: '_blank'
		});
	}
*/
    // 피드 로드
    $('#current-feed').FeedEk({
        FeedUrl: url,
        MaxCount: 100,
        // DateFormat: 'YYYY-MM-DD',
        ShowDesc: true,
        ShowPubDate: true,
        // DescCharacterLimit: 150,
        TitleLinkTarget: '_blank',
        // FeedEk의 성공/실패 콜백 활용
        Success: function () {
            // 로딩 완료 → 스피너 숨기기
            $('#loading-spinner').hide();
        },
        Error: function () {
            $('#loading-spinner').html(
                '<p style="color: red;">피드를 불러오지 못했습니다.<br>주소를 확인해 주세요.</p>'
            );
            setTimeout(() => {
                $('#loading-spinner').hide();
            }, 5000); // 5초 후 자동 숨김
        }
    });
}


/******************************************************************************************/

    // 페이지 로드 시 기본값 설정 (예: 연합뉴스)
    const defaultUrl = "http://www.yonhapnewstv.co.kr/browse/feed/";
    $('#rssResult').val(defaultUrl);
    $('#rssSelect').val(defaultUrl); // 선택되게
    loadFeed(defaultUrl, "연합뉴스");
});