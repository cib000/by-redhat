# 🖥️ ㅁ자의 GitHub 연구실 - by-redhat

> 이곳은 ㅁ자의 소소한 개발 테스트와 개인 설정 연구실입니다.  
> GitHub 프로필 관련 설정 파일과 관리 체크리스트, Markdown 정리 문서를 보관합니다.

---

## 📁 저장소 구성

| 파일명 | 설명 |
|--------|------|
| `README.md` | 저장소 소개 및 목적 설명 |
| `관리 체크리스트.md` | GitHub/Markdown/관리용 체크리스트 |
| `읽어보기 - 관리.md` | 추가 참고용 정리 문서 |
| `images/` | 문서용 이미지 저장 폴더 |

---

이곳은 ㅁ자의 소소한 개발 테스트 연구실입니다.

최고일 수 없고, 최선일 수 없습니다.

인증서를 포함하지 않으며, 예외처리는 필수입니다.

# 필수 사항

## 반드시 인지하고 숙지하신 후 접근하시기 바람니다.

### 1. 기본 기준 원칙

- 일체의 펌을 당분간 금지합니다.

- 자작에 대해서는 권한 이양이 없습니다. ( 일정시간 )

### 2. 게인의 공간임을 반드시 인지

- 개인의 사념및 개발에 대한 소일이므로 이를 반드시 인지하십시요.


### 3. 원문 무훼손의 원칙과 정보자료 취급 5계율

- 타인의 작품 또는 지역화에서 이름만 바꿔치기 등의 몰상식한 행위는 하지 않는다.

- 타인의 작품을 모조리 까발리는 행위를 하지 않는다.

- 의뢰받은 건에 대한 비밀의 엄수는 목숨처럼 여긴다.

- 좋을때도 심지어 원수가 되더라도 비밀엄수는 목숨처럼 여기도록 한다.

- 어떠한 경우라도 원칙과 기준은 반드시 엄수하여야 한다.

---


────────────────────────────────────────────────────────────────


# 📝 Markdown & YAML 총정리

이 문서는 Markdown 기본 문법, 구문 표시, 목록, 구분선, 이미지, 링크, HTML 대응 예시, 그리고 YAML 활용까지 통합 정리한 문서입니다.

---

## 1️⃣ Markdown 구문 표시 (Code Block)

### 1-1. 한 줄 코드
```markdown
`한 줄 코드 표시`
```

렌더링 결과: 한 줄 코드 표시

1-2. 여러 줄 코드 (Code Block)
```def hello():
    print("Hello, Markdown!")

```

렌더링 결과:

def hello():
    print("Hello, Markdown!")



2️⃣ 목록 표시 (UL / LI)
2-1. Markdown 방식
```- 항목 1
- 항목 2
  - 하위 항목 2-1
  - 하위 항목 2-2
- 항목 3
```

렌더링 결과:

항목 1

항목 2

하위 항목 2-1

하위 항목 2-2

항목 3

2-2. HTML 방식
```<ul>
  <li>항목 1</li>
  <li>항목 2
    <ul>
      <li>하위 항목 2-1</li>
      <li>하위 항목 2-2</li>
    </ul>
  </li>
  <li>항목 3</li>
</ul>
```

렌더링 결과:

<ul> <li>항목 1</li> <li>항목 2 <ul> <li>하위 항목 2-1</li> <li>하위 항목 2-2</li> </ul> </li> <li>항목 3</li> </ul>



3️⃣ 수평 구분선 (Horizontal Rule)
Markdown
---


렌더링 결과:

```HTML
<hr>
```

렌더링 결과:

<hr>



4️⃣ 이미지 삽입
Markdown
![이미지 설명](images/sample.png)

```HTML
<img src="images/sample.png" alt="이미지 설명" width="300">
```


5️⃣ 링크
Markdown
[GitHub](https://github.com)


렌더링 결과: GitHub

HTML
<a href="https://github.com" target="_blank">GitHub</a>


렌더링 결과: <a href="https://github.com" target="_blank">GitHub</a>




6️⃣ YAML 소개

YAML = YAML Ain’t Markup Language

사람 읽기 쉬운 데이터 직렬화 형식

JSON, XML과 비슷하지만 가독성 높음

주로 설정 파일, 자동화, DevOps 등에서 사용

6-1. YAML 기본 특징

들여쓰기로 구조 표현

키-값 쌍 key: value

리스트 표현 - 항목1

주석 가능 # 설명

6-2. YAML 예시
```server:
  host: 127.0.0.1
  port: 8080
  ssl: true

users:
  - name: Alice
    role: admin
  - name: Bob
    role: user
```


7️⃣ Markdown과 YAML 연계

Markdown 안에서 YAML 블록으로 예시를 삽입 가능

```yaml
key: value
list:
  - item1
  - item2
```

- 실제 동작/설정용으로는 **별도 `.yaml` 파일 필요**

---

## 8️⃣ 핵심 요약

```1
- Markdown: **설명서, 문서화**  
- YAML: **설정, 데이터 직렬화**  
- Markdown 안에 YAML 예시는 **문서화 목적**  
- 이미지, 링크, 코드 블록, 구분선, 목록 등 모두 **가독성 중심**  
- 필요시 HTML 태그와 혼합 가능  
- GitHub에서도 바로 렌더링 가능
```

---

## 9️⃣ 참고 팁

1. 구분선(`---`) 전후로 빈 줄 넣기
2. 리스트 들여쓰기 주의 (2~4 스페이스 권장)
3. 이미지/파일명 ASCII 기반으로 관리
4. VS Code, 노트패드++ 등 편한 에디터 활용


이렇게 하면 Markdown 문서 한 파일 안에서

Markdown 문법 예제

HTML 대응 예제

YAML 소개 + 예제

구분선, 코드 블록, 이미지, 링크까지 모두 포함

한눈에 볼 수 있는 완전 통합 문서가 됩니다.
