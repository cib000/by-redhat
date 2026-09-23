"use strict";

var qrcodegen = new function() {

	// QR 코드 객체 생성자 (로우 레벨)
	this.QrCode = function(version, errCorLvl, dataCodewords, mask) {
		
		/*---- 생성자 검증 및 초기화 ----*/
		
		// 인수 유효성 검사 (버전 및 마스크 범위 확인)
		if (version < MIN_VERSION || version > MAX_VERSION)
			throw "버전 값이 허용 범위를 벗어났습니다.";
		if (mask < -1 || mask > 7)
			throw "마스크 값이 허용 범위를 벗어났습니다.";
		if (!(errCorLvl instanceof Ecc))
			throw "QrCode.Ecc 객체가 필요합니다.";
		var size = version * 4 + 17;
		
		// 모듈(픽셀) 그리드 초기화 (모두 false/하얀색으로 설정)
		var row = [];
		for (var i = 0; i < size; i++)
			row.push(false);
		var modules    = [];  
		var isFunction = [];
		for (var i = 0; i < size; i++) {
			modules   .push(row.slice());
			isFunction.push(row.slice());
		}
		
		// 오류 정정(ECC) 계산 및 모듈 그리기
		drawFunctionPatterns();
		var allCodewords = addEccAndInterleave(dataCodewords);
		drawCodewords(allCodewords);
		
		// 마스킹 처리 수행
		if (mask == -1) {  // 최적의 마스크 자동 선택
			var minPenalty = Infinity;
			for (var i = 0; i < 8; i++) {
				drawFormatBits(i);
				applyMask(i);
				var penalty = getPenaltyScore();
				if (penalty < minPenalty) {
					mask = i;
					minPenalty = penalty;
				}
				applyMask(i);  // XOR 연산을 통해 마스크 원상복구
			}
		}
		if (mask < 0 || mask > 7)
			throw "어설션 오류 (마스크 범위 초과)";
		drawFormatBits(mask);  // 기존 포맷 비트 덮어쓰기
		applyMask(mask);       // 최종 선택된 마스크 적용
		
		isFunction = null;
		
		
		/*---- 읽기 전용 인스턴스 속성 ----*/
		
		// QR 코드 버전 (1 ~ 40)
		Object.defineProperty(this, "version", {value:version});
		
		// QR 코드 가로/세로 크기 (21 ~ 177)
		Object.defineProperty(this, "size", {value:size});
		
		// 오류 정정 수준 (ECC Level)
		Object.defineProperty(this, "errorCorrectionLevel", {value:errCorLvl});
		
		// 사용된 마스크 패턴 인덱스 (0 ~ 7)
		Object.defineProperty(this, "mask", {value:mask});
		
		
		/*---- 접근자 메서드 ----*/
		
		// 특정 좌표(x, y)의 모듈 색상 반환 (false: 흰색, true: 검은색)
		this.getModule = function(x, y) {
			return 0 <= x && x < size && 0 <= y && y < size && modules[y][x];
		};
		
		
		/*---- 공개 인스턴스 메서드 ----*/
		
		// HTML 캔버스(Canvas)에 QR 코드 그리기
		this.drawCanvas = function(scale, border, canvas) {
			if (scale <= 0 || border < 0)
				throw "값이 허용 범위를 벗어났습니다.";
			var width = (size + border * 2) * scale;
			canvas.width = width;
			canvas.height = width;
			var ctx = canvas.getContext("2d");
			for (var y = -border; y < size + border; y++) {
				for (var x = -border; x < size + border; x++) {
					ctx.fillStyle = this.getModule(x, y) ? "#000000" : "#FFFFFF";
					ctx.fillRect((x + border) * scale, (y + border) * scale, scale, scale);
				}
			}
		};
		
		// SVG 코드 문자열로 변환하여 반환
		this.toSvgString = function(border) {
			if (border < 0)
				throw "테두리는 음수가 될 수 없습니다.";
			var parts = [];
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					if (this.getModule(x, y))
						parts.push("M" + (x + border) + "," + (y + border) + "h1v1h-1z");
				}
			}
			return '<?xml version="1.0" encoding="UTF-8"?>\n' +
				'<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n' +
				'<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 ' +
					(size + border * 2) + ' ' + (size + border * 2) + '" stroke="none">\n' +
				'\t<rect width="100%" height="100%" fill="#FFFFFF"/>\n' +
				'\t<path d="' + parts.join(" ") + '" fill="#000000"/>\n' +
				'</svg>\n';
		};
		
		
		/*---- 내부 헬퍼 메서드: 기능 모듈 드로잉 ----*/
		
		function drawFunctionPatterns() {
			// 타이밍 패턴(Timing Pattern) 그리기
			for (var i = 0; i < size; i++) {
				setFunctionModule(6, i, i % 2 == 0);
				setFunctionModule(i, 6, i % 2 == 0);
			}
			
			// 파인더 패턴(Finder Pattern) 3개 모서리에 그리기
			drawFinderPattern(3, 3);
			drawFinderPattern(size - 4, 3);
			drawFinderPattern(3, size - 4);
			
			// 얼라인먼트 패턴(Alignment Pattern) 그리기
			var alignPatPos = getAlignmentPatternPositions();
			var numAlign = alignPatPos.length;
			for (var i = 0; i < numAlign; i++) {
				for (var j = 0; j < numAlign; j++) {
					if (!(i == 0 && j == 0 || i == 0 && j == numAlign - 1 || i == numAlign - 1 && j == 0))
						drawAlignmentPattern(alignPatPos[i], alignPatPos[j]);
				}
			}
			
			// 구성 데이터 그리기
			drawFormatBits(0);
			drawVersion();
		}
		
		function drawFormatBits(mask) {
			var data = errCorLvl.formatBits << 3 | mask;
			var rem = data;
			for (var i = 0; i < 10; i++)
				rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
			var bits = (data << 10 | rem) ^ 0x5412;
			if (bits >>> 15 != 0)
				throw "어설션 오류";
			
			for (var i = 0; i <= 5; i++)
				setFunctionModule(8, i, getBit(bits, i));
			setFunctionModule(8, 7, getBit(bits, 6));
			setFunctionModule(8, 8, getBit(bits, 7));
			setFunctionModule(7, 8, getBit(bits, 8));
			for (var i = 9; i < 15; i++)
				setFunctionModule(14 - i, 8, getBit(bits, i));
			
			for (var i = 0; i < 8; i++)
				setFunctionModule(size - 1 - i, 8, getBit(bits, i));
			for (var i = 8; i < 15; i++)
				setFunctionModule(8, size - 15 + i, getBit(bits, i));
			setFunctionModule(8, size - 8, true);
		}
		
		function drawVersion() {
			if (version < 7)
				return;
			var rem = version;
			for (var i = 0; i < 12; i++)
				rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
			var bits = version << 12 | rem;
			if (bits >>> 18 != 0)
				throw "어설션 오류";
			
			for (var i = 0; i < 18; i++) {
				var bit = getBit(bits, i);
				var a = size - 11 + i % 3;
				var b = Math.floor(i / 3);
				setFunctionModule(a, b, bit);
				setFunctionModule(b, a, bit);
			}
		}
		
		function drawFinderPattern(x, y) {
			for (var dy = -4; dy <= 4; dy++) {
				for (var dx = -4; dx <= 4; dx++) {
					var dist = Math.max(Math.abs(dx), Math.abs(dy));
					var xx = x + dx, yy = y + dy;
					if (0 <= xx && xx < size && 0 <= yy && yy < size)
						setFunctionModule(xx, yy, dist != 2 && dist != 4);
				}
			}
		}
		
		function drawAlignmentPattern(x, y) {
			for (var dy = -2; dy <= 2; dy++) {
				for (var dx = -2; dx <= 2; dx++)
					setFunctionModule(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) != 1);
			}
		}
		
		function setFunctionModule(x, y, isBlack) {
			modules[y][x] = isBlack;
			isFunction[y][x] = true;
		}
		
		
		/*---- 내부 헬퍼 메서드: 코드워드 및 마스킹 ----*/
		
		function addEccAndInterleave(data) {
			if (data.length != QrCode.getNumDataCodewords(version, errCorLvl))
				throw "인수가 잘못되었습니다.";
			
			var numBlocks = QrCode.NUM_ERROR_CORRECTION_BLOCKS[errCorLvl.ordinal][version];
			var blockEccLen = QrCode.ECC_CODEWORDS_PER_BLOCK  [errCorLvl.ordinal][version];
			var rawCodewords = Math.floor(QrCode.getNumRawDataModules(version) / 8);
			var numShortBlocks = numBlocks - rawCodewords % numBlocks;
			var shortBlockLen = Math.floor(rawCodewords / numBlocks);
			
			var blocks = [];
			var rs = new ReedSolomonGenerator(blockEccLen);
			for (var i = 0, k = 0; i < numBlocks; i++) {
				var dat = data.slice(k, k + shortBlockLen - blockEccLen + (i < numShortBlocks ? 0 : 1));
				k += dat.length;
				var ecc = rs.getRemainder(dat);
				if (i < numShortBlocks)
					dat.push(0);
				blocks.push(dat.concat(ecc));
			}
			
			var result = [];
			for (var i = 0; i < blocks[0].length; i++) {
				for (var j = 0; j < blocks.length; j++) {
					if (i != shortBlockLen - blockEccLen || j >= numShortBlocks)
						result.push(blocks[j][i]);
				}
			}
			if (result.length != rawCodewords)
				throw "어설션 오류";
			return result;
		}
		
		function drawCodewords(data) {
			if (data.length != Math.floor(QrCode.getNumRawDataModules(version) / 8))
				throw "인수가 잘못되었습니다.";
			var i = 0;
			for (var right = size - 1; right >= 1; right -= 2) {
				if (right == 6)
					right = 5;
				for (var vert = 0; vert < size; vert++) {
					for (var j = 0; j < 2; j++) {
						var x = right - j;
						var upward = ((right + 1) & 2) == 0;
						var y = upward ? size - 1 - vert : vert;
						if (!isFunction[y][x] && i < data.length * 8) {
							modules[y][x] = getBit(data[i >>> 3], 7 - (i & 7));
							i++;
						}
					}
				}
			}
			if (i != data.length * 8)
				throw "어설션 오류";
		}
		
		function applyMask(mask) {
			if (mask < 0 || mask > 7)
				throw "마스크 값이 범위를 벗어났습니다.";
			for (var y = 0; y < size; y++) {
				for (var x = 0; x < size; x++) {
					var invert;
					switch (mask) {
						case 0:  invert = (x + y) % 2 == 0;                                  break;
						case 1:  invert = y % 2 == 0;                                        break;
						case 2:  invert = x % 3 == 0;                                        break;
						case 3:  invert = (x + y) % 3 == 0;                                  break;
						case 4:  invert = (Math.floor(x / 3) + Math.floor(y / 2)) % 2 == 0;  break;
						case 5:  invert = x * y % 2 + x * y % 3 == 0;                        break;
						case 6:  invert = (x * y % 2 + x * y % 3) % 2 == 0;                  break;
						case 7:  invert = ((x + y) % 2 + x * y % 3) % 2 == 0;                break;
						default:  throw "어설션 오류";
					}
					if (!isFunction[y][x] && invert)
						modules[y][x] = !modules[y][x];
				}
			}
		}
		
		function getPenaltyScore() {
			var result = 0;
			
			// 행 페널티 계산
			for (var y = 0; y < size; y++) {
				var runHistory = [0,0,0,0,0,0,0];
				var color = false;
				var runX = 0;
				for (var x = 0; x < size; x++) {
					if (modules[y][x] == color) {
						runX++;
						if (runX == 5)
							result += QrCode.PENALTY_N1;
						else if (runX > 5)
							result++;
					} else {
						QrCode.addRunToHistory(runX, runHistory);
						if (!color && QrCode.hasFinderLikePattern(runHistory))
							result += QrCode.PENALTY_N3;
						color = modules[y][x];
						runX = 1;
					}
				}
				QrCode.addRunToHistory(runX, runHistory);
				if (color)
					QrCode.addRunToHistory(0, runHistory);
				if (QrCode.hasFinderLikePattern(runHistory))
					result += QrCode.PENALTY_N3;
			}
			
			// 열 페널티 계산
			for (var x = 0; x < size; x++) {
				var runHistory = [0,0,0,0,0,0,0];
				var color = false;
				var runY = 0;
				for (var y = 0; y < size; y++) {
					if (modules[y][x] == color) {
						runY++;
						if (runY == 5)
							result += QrCode.PENALTY_N1;
						else if (runY > 5)
							result++;
					} else {
						QrCode.addRunToHistory(runY, runHistory);
						if (!color && QrCode.hasFinderLikePattern(runHistory))
							result += QrCode.PENALTY_N3;
						color = modules[y][x];
						runY = 1;
					}
				}
				QrCode.addRunToHistory(runY, runHistory);
				if (color)
					QrCode.addRunToHistory(0, runHistory);
				if (QrCode.hasFinderLikePattern(runHistory))
					result += QrCode.PENALTY_N3;
			}
			
			// 2x2 블록 페널티 계산
			for (var y = 0; y < size - 1; y++) {
				for (var x = 0; x < size - 1; x++) {
					var color = modules[y][x];
					if (color == modules[y][x + 1] &&
					    color == modules[y + 1][x] &&
					    color == modules[y + 1][x + 1])
						result += QrCode.PENALTY_N2;
				}
			}
			
			// 흑백 모듈 비율 페널티 계산
			var black = 0;
			modules.forEach(function(row) {
				row.forEach(function(color) {
					if (color)
						black++;
				});
			});
			var total = size * size;
			var k = Math.ceil(Math.abs(black * 20 - total * 10) / total) - 1;
			result += k * QrCode.PENALTY_N4;
			return result;
		}
		
		function getAlignmentPatternPositions() {
			if (version == 1)
				return [];
			else {
				var numAlign = Math.floor(version / 7) + 2;
				var step = (version == 32) ? 26 :
					Math.ceil((size - 13) / (numAlign*2 - 2)) * 2;
				var result = [6];
				for (var pos = size - 7; result.length < numAlign; pos -= step)
					result.splice(1, 0, pos);
				return result;
			}
		}
		
		function getBit(x, i) {
			return ((x >>> i) & 1) != 0;
		}
	};
	
	
	/*---- 정적 팩토리 함수 (하이 레벨) ----*/
	
	// 텍스트를 입력받아 QR 코드 객체 생성
	this.QrCode.encodeText = function(text, ecl) {
		var segs = qrcodegen.QrSegment.makeSegments(text);
		return this.encodeSegments(segs, ecl);
	};
	
	// 바이너리 데이터를 입력받아 QR 코드 객체 생성
	this.QrCode.encodeBinary = function(data, ecl) {
		var seg = qrcodegen.QrSegment.makeBytes(data);
		return this.encodeSegments([seg], ecl);
	};
	
	
	/*---- 정적 팩토리 함수 (미드 레벨) ----*/
	
	// 세그먼트 배열을 바탕으로 인코딩 파라미터 적용 후 QR 코드 생성
	this.QrCode.encodeSegments = function(segs, ecl, minVersion, maxVersion, mask, boostEcl) {
		if (minVersion == undefined) minVersion = MIN_VERSION;
		if (maxVersion == undefined) maxVersion = MAX_VERSION;
		if (mask == undefined) mask = -1;
		if (boostEcl == undefined) boostEcl = true;
		if (!(MIN_VERSION <= minVersion && minVersion <= maxVersion && maxVersion <= MAX_VERSION) || mask < -1 || mask > 7)
			throw "유효하지 않은 값";
		
		// 최소 버전 번호 탐색
		var version, dataUsedBits;
		for (version = minVersion; ; version++) {
			var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
			dataUsedBits = qrcodegen.QrSegment.getTotalBits(segs, version);
			if (dataUsedBits <= dataCapacityBits)
				break;
			if (version >= maxVersion)
				throw "데이터가 너무 깁니다.";
		}
		
		// 버전 증가 없이 오류 정정 수준(ECC) 향상 가능 시 업그레이드
		[this.Ecc.MEDIUM, this.Ecc.QUARTILE, this.Ecc.HIGH].forEach(function(newEcl) {
			if (boostEcl && dataUsedBits <= QrCode.getNumDataCodewords(version, newEcl) * 8)
				ecl = newEcl;
		});
		
		// 모든 세그먼트를 연결하여 데이터 비트 문자열 생성
		var bb = new BitBuffer();
		segs.forEach(function(seg) {
			bb.appendBits(seg.mode.modeBits, 4);
			bb.appendBits(seg.numChars, seg.mode.numCharCountBits(version));
			seg.getData().forEach(function(bit) {
				bb.push(bit);
			});
		});
		if (bb.length != dataUsedBits)
			throw "어설션 오류";
		
		// 종단 비트(Terminator) 및 바이트 패딩 추가
		var dataCapacityBits = QrCode.getNumDataCodewords(version, ecl) * 8;
		if (bb.length > dataCapacityBits)
			throw "어설션 오류";
		bb.appendBits(0, Math.min(4, dataCapacityBits - bb.length));
		bb.appendBits(0, (8 - bb.length % 8) % 8);
		if (bb.length % 8 != 0)
			throw "어설션 오류";
		
		// 용량이 찰 때까지 패딩 바이트 추가
		for (var padByte = 0xEC; bb.length < dataCapacityBits; padByte ^= 0xEC ^ 0x11)
			bb.appendBits(padByte, 8);
		
		// 비트를 빅 엔디안(Big Endian) 방식의 바이트로 패킹
		var dataCodewords = [];
		while (dataCodewords.length * 8 < bb.length)
			dataCodewords.push(0);
		bb.forEach(function(bit, i) {
			dataCodewords[i >>> 3] |= bit << (7 - (i & 7));
		});
		
		// 최종 QR 코드 객체 반환
		return new this(version, ecl, dataCodewords, mask);
	};

/*---- QrCode용 프라이빗 정적 헬퍼 함수 ----*/
	
	var QrCode = {};  // 속성을 할당하기 위한 프라이빗 객체 ('this.QrCode'와는 다름)
	
	// 주어진 버전 번호에서 기능 모듈을 제외하고 저장할 수 있는 데이터 비트 수를 반환합니다.
	// 나머지 비트가 포함되므로 8의 배수가 아닐 수 있습니다. 결과 범위는 [208, 29648]입니다.
	QrCode.getNumRawDataModules = function(ver) {
		if (ver < MIN_VERSION || ver > MAX_VERSION)
			throw "버전 번호가 허용 범위를 벗어났습니다.";
		var result = (16 * ver + 128) * ver + 64;
		if (ver >= 2) {
			var numAlign = Math.floor(ver / 7) + 2;
			result -= (25 * numAlign - 10) * numAlign - 55;
			if (ver >= 7)
				result -= 36;
		}
		return result;
	};
	
	// 주어진 버전 번호와 오류 정정 수준에서 나머지 비트를 제외하고 포함된 8비트 데이터 코드워드(오류 정정 제외) 수를 반환합니다.
	QrCode.getNumDataCodewords = function(ver, ecl) {
		return Math.floor(QrCode.getNumRawDataModules(ver) / 8) -
			QrCode.ECC_CODEWORDS_PER_BLOCK    [ecl.ordinal][ver] *
			QrCode.NUM_ERROR_CORRECTION_BLOCKS[ecl.ordinal][ver];
	};
	
	// 주어진 배열의 맨 앞에 값을 삽입하고 기존 값들을 밀어낸 후 마지막 값을 삭제합니다. (getPenaltyScore()를 위한 헬퍼 함수)
	QrCode.addRunToHistory = function(run, history) {
		history.pop();
		history.unshift(run);
	};
	
	// 주어진 실행 기록이 중간에 1:1:3:1:1 비율의 패턴을 가지고 있고, 양쪽 또는 한쪽 끝에 최소 4개 이상으로 둘러싸여 있는지 테스트합니다.
	QrCode.hasFinderLikePattern = function(runHistory) {
		var n = runHistory[1];
		return n > 0 && runHistory[2] == n && runHistory[4] == n && runHistory[5] == n
			&& runHistory[3] == n * 3 && Math.max(runHistory[0], runHistory[6]) >= n * 4;
	};
	
	
	/*---- QrCode 상수 및 테이블 ----*/
	
	var MIN_VERSION =  1;  // QR 코드 모델 2 표준에서 지원하는 최소 버전 번호
	var MAX_VERSION = 40;  // QR 코드 모델 2 표준에서 지원하는 최대 버전 번호
	Object.defineProperty(this.QrCode, "MIN_VERSION", {value:MIN_VERSION});
	Object.defineProperty(this.QrCode, "MAX_VERSION", {value:MAX_VERSION});
	
	// 최적의 마스크를 평가할 때 getPenaltyScore()에서 사용되는 페널티 가중치
	QrCode.PENALTY_N1 =  3;
	QrCode.PENALTY_N2 =  3;
	QrCode.PENALTY_N3 = 40;
	QrCode.PENALTY_N4 = 10;
	
	// 블록당 오류 정정 코드워드 테이블
	QrCode.ECC_CODEWORDS_PER_BLOCK = [
		[null,  7, 10, 15, 20, 26, 18, 20, 24, 30, 18, 20, 24, 26, 30, 22, 24, 28, 30, 28, 28, 28, 28, 30, 30, 26, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // Low (약 7% 복원)
		[null, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26, 30, 22, 22, 24, 24, 28, 28, 26, 26, 26, 26, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28, 28],  // Medium (약 15% 복원)
		[null, 13, 22, 18, 26, 18, 24, 18, 22, 20, 24, 28, 26, 24, 20, 30, 24, 28, 28, 26, 30, 28, 30, 30, 30, 30, 28, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // Quartile (약 25% 복원)
		[null, 17, 28, 22, 16, 22, 28, 26, 26, 24, 28, 24, 28, 22, 24, 24, 30, 28, 28, 26, 28, 30, 24, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30, 30],  // High (약 30% 복원)
	];
	
	// 오류 정정 블록 수 테이블
	QrCode.NUM_ERROR_CORRECTION_BLOCKS = [
		[null, 1, 1, 1, 1, 1, 2, 2, 2, 2, 4,  4,  4,  4,  4,  6,  6,  6,  6,  7,  8,  8,  9,  9, 10, 12, 12, 12, 13, 14, 15, 16, 17, 18, 19, 19, 20, 21, 22, 24, 25],  // Low
		[null, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5,  5,  8,  9,  9, 10, 10, 11, 13, 14, 16, 17, 17, 18, 20, 21, 23, 25, 26, 28, 29, 31, 33, 35, 37, 38, 40, 43, 45, 47, 49],  // Medium
		[null, 1, 1, 2, 2, 4, 4, 6, 6, 8, 8,  8, 10, 12, 16, 12, 17, 16, 18, 21, 20, 23, 23, 25, 27, 29, 34, 34, 35, 38, 40, 43, 45, 48, 51, 53, 56, 59, 62, 65, 68],  // Quartile
		[null, 1, 1, 2, 4, 4, 4, 5, 6, 8, 8, 11, 11, 16, 16, 18, 16, 19, 21, 25, 25, 25, 34, 30, 32, 35, 37, 40, 42, 45, 48, 51, 54, 57, 60, 63, 66, 70, 74, 77, 81],  // High
	];
	
	
	/*---- 공개 헬퍼 열거형 (Enumeration) ----*/
	
	// QR 코드 심볼의 오류 정정 수준 (불변 객체)
	this.QrCode.Ecc = {
		LOW     : new Ecc(0, 1),  // 약 7%의 오류 코드워드 허용
		MEDIUM  : new Ecc(1, 0),  // 약 15%의 오류 코드워드 허용
		QUARTILE: new Ecc(2, 3),  // 약 25%의 오류 코드워드 허용
		HIGH    : new Ecc(3, 2),  // 약 30%의 오류 코드워드 허용
	};
	
	// 프라이빗 생성자
	function Ecc(ord, fb) {
		Object.defineProperty(this, "ordinal", {value:ord});      // 0 ~ 3 범위 (부호 없는 2비트 정수)
		Object.defineProperty(this, "formatBits", {value:fb});   // 0 ~ 3 범위 (포맷 비트)
	}
	
	
	/*---- 데이터 세그먼트 클래스 ----*/
	
	// QR 코드 심볼 내의 문자/바이낸리/제어 데이터 세그먼트 (불변 객체)
	this.QrSegment = function(mode, numChars, bitData) {
		/*---- 생성자 (로우 레벨) ----*/
		if (numChars < 0 || !(mode instanceof Mode))
			throw "인수가 잘못되었습니다.";
		
		bitData = bitData.slice();  // 방어적 복사 수행
		
		Object.defineProperty(this, "mode", {value:mode});         // 세그먼트 모드 지시자
		Object.defineProperty(this, "numChars", {value:numChars}); // 인코딩되지 않은 데이터의 길이
		
		// 세그먼트의 데이터 비트 복사본 반환
		this.getData = function() {
			return bitData.slice();  // 방어적 복사 수행
		};
	};
	
	
	/*---- 정적 팩토리 함수 (미드 레벨) - QrSegment용 ----*/
	
	// 바이트 모드로 인코딩된 주어진 바이너리 데이터를 나타내는 세그먼트를 반환합니다.
	this.QrSegment.makeBytes = function(data) {
		var bb = new BitBuffer();
		data.forEach(function(b) {
			bb.appendBits(b, 8);
		});
		return new this(this.Mode.BYTE, data.length, bb);
	};
	
	
/* 
	 * 숫자 모드로 인코딩된 주어진 10진수 문자열을 나타내는 세그먼트를 반환합니다.
	 */
	this.QrSegment.makeNumeric = function(digits) {
		if (!this.NUMERIC_REGEX.test(digits))
			throw "문자열에 숫자가 아닌 문자가 포함되어 있습니다.";
		var bb = new BitBuffer();
		for (var i = 0; i < digits.length; ) {  // 반복당 최대 3자 처리
			var n = Math.min(digits.length - i, 3);
			bb.appendBits(parseInt(digits.substring(i, i + n), 10), n * 3 + 1);
			i += n;
		}
		return new this(this.Mode.NUMERIC, digits.length, bb);
	};
	
	/* 
	 * 알파벳/숫자 모드로 인코딩된 주어진 텍스트 문자열을 나타내는 세그먼트를 반환합니다.
	 * 허용되는 문자: 0~9, A~Z(대문자만), 공백, 달러($), 퍼센트(%), 별표(*), 
	 * 플러스(+), 하이픈(-), 마침표(.), 슬래시(/), 콜론(:)
	 */
	this.QrSegment.makeAlphanumeric = function(text) {
		if (!this.ALPHANUMERIC_REGEX.test(text))
			throw "문자열에 알파벳 모드에서 인코딩할 수 없는 문자가 포함되어 있습니다.";
		var bb = new BitBuffer();
		var i;
		for (i = 0; i + 2 <= text.length; i += 2) {  // 2글자씩 그룹으로 처리
			var temp = QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)) * 45;
			temp += QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i + 1));
			bb.appendBits(temp, 11);
		}
		if (i < text.length)  // 1글자가 남은 경우
			bb.appendBits(QrSegment.ALPHANUMERIC_CHARSET.indexOf(text.charAt(i)), 6);
		return new this(this.Mode.ALPHANUMERIC, text.length, bb);
	};
	
	/* 
	 * 주어진 유니코드 텍스트 문자열을 나타내는 0개 이상의 세그먼트로 구성된 새로운 가변 리스트를 반환합니다.
	 * 비트 스트림의 길이를 최적화하기 위해 다양한 세그먼트 모드와 전환 방식을 사용할 수 있습니다.
	 */
	this.QrSegment.makeSegments = function(text) {
		// 가장 효율적인 세그먼트 인코딩을 자동으로 선택
		if (text == "")
			return [];
		else if (this.NUMERIC_REGEX.test(text))
			return [this.makeNumeric(text)];
		else if (this.ALPHANUMERIC_REGEX.test(text))
			return [this.makeAlphanumeric(text)];
		else
			return [this.makeBytes(toUtf8ByteArray(text))];
	};
	
	/* 
	 * 주어진 할당 값을 갖는 확장 채널 해석(ECI) 지정자를 나타내는 세그먼트를 반환합니다.
	 */
	this.QrSegment.makeEci = function(assignVal) {
		var bb = new BitBuffer();
		if (assignVal < 0)
			throw "ECI 할당 값이 범위를 벗어났습니다.";
		else if (assignVal < (1 << 7))
			bb.appendBits(assignVal, 8);
		else if (assignVal < (1 << 14)) {
			bb.appendBits(2, 2);
			bb.appendBits(assignVal, 14);
		} else if (assignVal < 1000000) {
			bb.appendBits(6, 3);
			bb.appendBits(assignVal, 21);
		} else
			throw "ECI 할당 값이 범위를 벗어났습니다.";
		return new this(this.Mode.ECI, 0, bb);
	};
	
	// 주어진 버전에서 주어진 세그먼트들을 인코딩하는 데 필요한 비트 수를 계산하여 반환합니다.
	// 세그먼트에 길이 필드에 맞지 않을 정도로 너무 많은 문자가 포함된 경우 무한대(Infinity)를 반환합니다.
	this.QrSegment.getTotalBits = function(segs, version) {
		var result = 0;
		for (var i = 0; i < segs.length; i++) {
			var seg = segs[i];
			var ccbits = seg.mode.numCharCountBits(version);
			if (seg.numChars >= (1 << ccbits))
				return Infinity;  // 세그먼트 길이가 필드의 비트 폭에 맞지 않음
			result += 4 + ccbits + seg.getData().length;
		}
		return result;
	};
	
	
	/*---- QrSegment 상수 ----*/
	
	var QrSegment = {};  // 속성을 할당하기 위한 프라이빗 객체 ('this.QrSegment'와는 다름)
	
	// 숫자 모드에서 인코딩 가능한 모든 문자열을 정확히 설명하는 정규식
	this.QrSegment.NUMERIC_REGEX = /^[0-9]*$/;
	
	// 알파벳 모드에서 인코딩 가능한 모든 문자열을 정확히 설명하는 정규식
	this.QrSegment.ALPHANUMERIC_REGEX = /^[A-Z0-9 $%*+.\/:-]*$/;
	
	// 알파벳 모드의 모든 유효한 문자 셋 (각 문자는 문자열 내 인덱스로 매핑됨)
	QrSegment.ALPHANUMERIC_CHARSET = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:";
	
	
	/*---- 공개 헬퍼 열거형 (Enumeration) ----*/
	
	/* 
	 * 세그먼트의 데이터 비트가 해석되는 방식을 설명합니다. (불변 객체)
	 */
	this.QrSegment.Mode = {
		NUMERIC     : new Mode(0x1, [10, 12, 14]),
		ALPHANUMERIC: new Mode(0x2, [ 9, 11, 13]),
		BYTE        : new Mode(0x4, [ 8, 16, 16]),
		KANJI       : new Mode(0x8, [ 8, 10, 12]),
		ECI         : new Mode(0x7, [ 0,  0,  0]),
	};
	
	// 프라이빗 생성자
	function Mode(mode, ccbits) {
		// 모드 지시자 비트 (uint4 값, 범위 0 ~ 15)
		Object.defineProperty(this, "modeBits", {value:mode});
		
		// 주어진 버전 번호의 QR 코드에서 해당 모드의 문자 카운트 필드 비트 폭 반환 (범위 [0, 16])
		this.numCharCountBits = function(ver) {
			return ccbits[Math.floor((ver + 7) / 17)];
		};
	}
	
	
	/*---- 프라이빗 헬퍼 함수 및 클래스 ----*/
	
	// 주어진 문자열을 UTF-8로 인코딩한 바이트 배열을 반환합니다.
	function toUtf8ByteArray(str) {
		str = encodeURI(str);
		var result = [];
		for (var i = 0; i < str.length; i++) {
			if (str.charAt(i) != "%")
				result.push(str.charCodeAt(i));
			else {
				result.push(parseInt(str.substring(i + 1, i + 3), 16));
				i += 2;
			}
		}
		return result;
	}
	
	
	
/* 
	 * 주어진 차수(degree)에 대한 데이터 코드워드 시퀀스의 리드-솔로몬 오류 정정 코드워드를 계산하는 프라이빗 헬퍼 클래스.
	 * 객체는 불변(immutable)이며, 상태는 오직 차수에만 의존합니다.
	 * QR 코드의 각 데이터 블록은 동일한 제수 다항식(divisor polynomial)을 공유하기 때문에 이 클래스가 존재합니다.
	 * 이 생성자는 주어진 차수에 대한 리드-솔로몬 ECC generator를 생성합니다.
	 */
	function ReedSolomonGenerator(degree) {
		if (degree < 1 || degree > 255)
			throw "차수가 허용 범위를 벗어났습니다.";
		
		// 제수 다항식의 계수. 최고차항(항상 1임)을 제외하고 높은 차수부터 낮은 차수 순으로 저장됩니다.
		// 예를 들어 다항식 x^3 + 255x^2 + 8x + 93은 uint8 배열 {255, 8, 93}으로 저장됩니다.
		var coefficients = [];
		
		// 단항식 x^0으로 시작
		for (var i = 0; i < degree - 1; i++)
			coefficients.push(0);
		coefficients.push(1);
		
		// 곱셈 다항식 (x - r^0) * (x - r^1) * ... * (x - r^{degree-1})을 계산하고,
		// 최고차항을 제외한 나머지 계수를 내림차순으로 저장합니다.
		// 여기서 r = 0x02이며, 이는 GF(2^8/0x11D) 필드의 생성원(generator element)입니다.
		var root = 1;
		for (var i = 0; i < degree; i++) {
			// 현재 곱에 (x - r^i)를 곱함
			for (var j = 0; j < coefficients.length; j++) {
				coefficients[j] = ReedSolomonGenerator.multiply(coefficients[j], root);
				if (j + 1 < coefficients.length)
					coefficients[j] ^= coefficients[j + 1];
			}
			root = ReedSolomonGenerator.multiply(root, 0x02);
		}
		
		// 주어진 데이터 코드워드 시퀀스에 대한 리드-솔로몬 오류 정정 코드워드를 계산하여 반환합니다.
		// 반환되는 객체는 항상 새로운 바이트 배열입니다. (불변 객체이므로 이 객체의 상태는 변경되지 않음)
		this.getRemainder = function(data) {
			// 다항식 나눗셈을 수행하여 나머지 계산
			var result = coefficients.map(function() { return 0; });
			data.forEach(function(b) {
				var factor = b ^ result.shift();
				result.push(0);
				for (var i = 0; i < result.length; i++)
					result[i] ^= ReedSolomonGenerator.multiply(coefficients[i], factor);
			});
			return result;
		};
	}
	
	// 이 정적 함수는 주어진 두 필드 요소의 곱을 모듈로 GF(2^8/0x11D) 연산으로 반환합니다.
	// 인자와 결과는 부호 없는 8비트 정수입니다.
	ReedSolomonGenerator.multiply = function(x, y) {
		if (x >>> 8 != 0 || y >>> 8 != 0)
			throw "바이트가 범위를 벗어났습니다.";
		// 러시아 농부 곱셈법(Russian peasant multiplication) 사용
		var z = 0;
		for (var i = 7; i >= 0; i--) {
			z = (z << 1) ^ ((z >>> 7) * 0x11D);
			z ^= ((y >>> i) & 1) * x;
		}
		if (z >>> 8 != 0)
			throw "어설션 오류";
		return z;
	};
	
	
	/* 
	 * 추가 가능한 비트 시퀀스(0과 1)를 나타내는 프라이빗 헬퍼 클래스.
	 * 주로 QrSegment에서 사용됩니다. 빈 비트 버퍼(길이 0)를 생성합니다.
	 */
	function BitBuffer() {
		Array.call(this);
		
		// 주어진 값의 하위 비트 중 지정된 개수만큼 이 버퍼에 추가합니다.
		// 조건: 0 <= len <= 31 이고 0 <= val < 2^len
		this.appendBits = function(val, len) {
			if (len < 0 || len > 31 || val >>> len != 0)
				throw "값이 범위를 벗어났습니다.";
			for (var i = len - 1; i >= 0; i--)  // 비트 단위로 추가
				this.push((val >>> i) & 1);
		};
	}
	
	BitBuffer.prototype = Object.create(Array.prototype);
	BitBuffer.prototype.constructor = BitBuffer;
	
};

/* 
 * QR Code generator demo (JavaScript)
 * Copyright (c) Project Nayuki. (MIT License)
 * https://www.nayuki.io/page/qr-code-generator-library
 */

"use strict";

var app = new function() {
	
	// 초기화 함수: 입력 폼 요소들에 이벤트 리스너를 등록하고 초기 QR 코드를 그립니다.
	function initialize() {
		var elems = document.querySelectorAll("input[type=number], textarea");
		for (var i = 0; i < elems.length; i++) {
			if (elems[i].id.indexOf("version-") != 0)
				elems[i].oninput = redrawQrCode;
		}
		elems = document.querySelectorAll("input[type=radio], input[type=checkbox]");
		for (var i = 0; i < elems.length; i++)
			elems[i].onchange = redrawQrCode;
		redrawQrCode();
	}
	
	// 입력값 변화에 따라 QR 코드를 다시 그리고 화면을 갱신합니다.
	function redrawQrCode() {
		// 비트맵 또는 벡터 이미지 출력 여부에 따라 행(row) 표시/숨김 처리
		var bitmapOutput = document.getElementById("output-format-bitmap").checked;
		var scaleRow = document.getElementById("scale-row");
		var svgXmlRow = document.getElementById("svg-xml-row");
		if (bitmapOutput) {
			scaleRow.style.removeProperty("display");
			svgXmlRow.style.display = "none";
		} else {
			scaleRow.style.display = "none";
			svgXmlRow.style.removeProperty("display");
		}
		var svgXml = document.getElementById("svg-xml-output");
		svgXml.value = "";
		
		// 조기 종료에 대비해 출력 이미지 초기화
		var canvas = document.getElementById("qrcode-canvas");
		var svg = document.getElementById("qrcode-svg");
		canvas.style.display = "none";
		svg.style.display = "none";
		
		// HTML 폼의 라디오 버튼을 기반으로 QrCode.Ecc 객체를 반환합니다.
		function getInputErrorCorrectionLevel() {
			if (document.getElementById("errcorlvl-medium").checked)
				return qrcodegen.QrCode.Ecc.MEDIUM;
			else if (document.getElementById("errcorlvl-quartile").checked)
				return qrcodegen.QrCode.Ecc.QUARTILE;
			else if (document.getElementById("errcorlvl-high").checked)
				return qrcodegen.QrCode.Ecc.HIGH;
			else  // 선택된 라디오 버튼이 없는 경우 기본값
				return qrcodegen.QrCode.Ecc.LOW;
		}
		
		// 폼 입력값을 가져와 QR 코드를 계산합니다.
		var ecl = getInputErrorCorrectionLevel();
		var text = document.getElementById("text-input").value;
		var segs = qrcodegen.QrSegment.makeSegments(text);
		var minVer = parseInt(document.getElementById("version-min-input").value, 10);
		var maxVer = parseInt(document.getElementById("version-max-input").value, 10);
		var mask = parseInt(document.getElementById("mask-input").value, 10);
		var boostEcc = document.getElementById("boost-ecc-input").checked;
		var qr = qrcodegen.QrCode.encodeSegments(segs, ecl, minVer, maxVer, mask, boostEcc);
		
		// 이미지 출력 그리기
		var border = parseInt(document.getElementById("border-input").value, 10);
		if (border < 0 || border > 100)
			return;
		if (bitmapOutput) {
			var scale = parseInt(document.getElementById("scale-input").value, 10);
			if (scale <= 0 || scale > 30)
				return;
			qr.drawCanvas(scale, border, canvas);
			canvas.style.removeProperty("display");
		} else {
			var code = qr.toSvgString(border);
			svg.setAttribute("viewBox", / viewBox="([^"]*)"/.exec(code)[1]);
			svg.querySelector("path").setAttribute("d", / d="([^"]*)"/.exec(code)[1]);
			svg.style.removeProperty("display");
			svgXml.value = qr.toSvgString(border);
		}
		
		// 주어진 세그먼트 리스트를 설명하는 문자열을 반환합니다.
		function describeSegments(segs) {
			if (segs.length == 0)
				return "none";
			else if (segs.length == 1) {
				var mode = segs[0].mode;
				var Mode = qrcodegen.QrSegment.Mode;
				if (mode == Mode.NUMERIC     )  return "numeric";
				if (mode == Mode.ALPHANUMERIC)  return "alphanumeric";
				if (mode == Mode.BYTE        )  return "byte";
				if (mode == Mode.KANJI       )  return "kanji";
				return "unknown";
			} else
				return "multiple";
		}
		
		// 주어진 UTF-16 문자열 내의 유니코드 코드 포인트 개수를 반환합니다.
		function countUnicodeChars(str) {
			var result = 0;
			for (var i = 0; i < str.length; i++, result++) {
				var c = str.charCodeAt(i);
				if (c < 0xD800 || c >= 0xE000)
					continue;
				else if (0xD800 <= c && c < 0xDC00 && i + 1 < str.length) {  // 상위 서러게이트(High surrogate)
					i++;
					var d = str.charCodeAt(i);
					if (0xDC00 <= d && d < 0xE000)  // 하위 서러게이트(Low surrogate)
						continue;
				}
				throw "잘못된 UTF-16 문자열입니다.";
			}
			return result;
		}
		
		// QR 코드 심볼의 통계 정보를 문자열로 표시합니다.
		var stats = "QR Code version = " + qr.version + ", ";
		stats += "mask pattern = " + qr.mask + ", ";
		stats += "character count = " + countUnicodeChars(text) + ",\n";
		stats += "encoding mode = " + describeSegments(segs) + ", ";
		stats += "error correction = level " + "LMQH".charAt(qr.errorCorrectionLevel.ordinal) + ", ";
		stats += "data bits = " + qrcodegen.QrSegment.getTotalBits(segs, qr.version) + ".";
		document.getElementById("statistics-output").textContent = stats;
	}
	
	// 최소/최대 버전 입력값을 제어하고 검증합니다.
	this.handleVersionMinMax = function(which) {
		var minElem = document.getElementById("version-min-input");
		var maxElem = document.getElementById("version-max-input");
		var minVal = parseInt(minElem.value, 10);
		var maxVal = parseInt(maxElem.value, 10);
		minVal = Math.max(Math.min(minVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
		maxVal = Math.max(Math.min(maxVal, qrcodegen.QrCode.MAX_VERSION), qrcodegen.QrCode.MIN_VERSION);
		if (which == "min" && minVal > maxVal)
			maxVal = minVal;
		else if (which == "max" && maxVal < minVal)
			minVal = maxVal;
		minElem.value = minVal.toString();
		maxElem.value = maxVal.toString();
		redrawQrCode();
	}
	
	initialize();
}