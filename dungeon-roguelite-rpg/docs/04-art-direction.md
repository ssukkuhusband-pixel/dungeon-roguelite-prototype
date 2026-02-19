# 아트 디렉션

## 비주얼 스타일

- **스타일**: 세미 리얼 일러스트 (Semi-Realistic Illustration)
  - 다키스트 던전의 진한 윤곽선 + 수채/유화 텍스처 느낌을 기반으로, 수집형 RPG에 맞게 캐릭터는 보다 선명하고 매력적으로 표현
  - 굵은 잉크 아웃라인 + 리치한 컬러 셰이딩으로 고딕 일러스트 느낌
  - 배경은 페인팅 터치의 어두운 분위기, 캐릭터는 상대적으로 밝고 디테일하게
- **참고 이미지/게임**:
  - **다키스트 던전 (Darkest Dungeon)**: 굵은 선화, 어두운 컬러, 횡스크롤 전투 레이아웃, 캐릭터 포즈
  - **AFK 아레나**: 캐릭터 일러스트 퀄리티, 수집형 RPG 카드 UI, 캠프 화면의 따뜻한 분위기
  - **그랑블루 판타지**: 판타지 캐릭터 일러스트의 세미 리얼 스타일, 스킬 이펙트 비주얼
  - **슬레이 더 스파이어**: 로그라이트 카드 선택 UI, 어두운 던전 톤

---

## 컬러 팔레트

### 공통 팔레트

| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| Primary | `#C8A84E` | 어두운 금색 - 주요 강조, 제목, 테두리 |
| Secondary | `#8B6914` | 진한 브론즈 - 보조 텍스트, 아이콘 |
| Background (Base) | `#1A1A2E` | 깊은 남색 - 기본 배경 |
| Background (Surface) | `#16213E` | 어두운 네이비 - 카드/패널 배경 |
| Accent | `#E94560` | 선홍색 - CTA 버튼, 위험 알림, 뽑기 강조 |
| Text Primary | `#F5F5DC` | 베이지 화이트 - 주요 텍스트 |
| Text Secondary | `#A0A0B8` | 연한 회보라 - 보조 텍스트 |
| Success | `#4ADE80` | 밝은 초록 - 회복, 버프, 성공 |
| Danger | `#EF4444` | 빨간색 - 피해, 디버프, 경고 |

### 장면별 팔레트: 모닥불 캠프 (메인 화면)

| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| Warm Glow | `#FF9F43` | 모닥불 주황 - 불빛 하이라이트 |
| Ember | `#E55039` | 잔불 빨강 - 불꽃 입자 |
| Warm Shadow | `#2C1810` | 따뜻한 갈색 어둠 - 그림자 기반 |
| Night Sky | `#0F0A1A` | 깊은 보라검정 - 밤하늘 배경 |
| Firelight Tint | `#FFF3E0` | 연한 노란 크림 - 불빛에 비친 오브젝트 |
| Camp Ground | `#3E2723` | 어두운 갈색 - 바닥 톤 |

### 장면별 팔레트: 던전 전투 (전투 화면)

| 용도 | 색상 코드 | 설명 |
|------|----------|------|
| Dungeon Dark | `#0D0D1A` | 거의 검정 남색 - 던전 깊은 배경 |
| Stone Gray | `#3A3A4A` | 회색 돌벽 톤 |
| Torch Amber | `#D4A017` | 횃불 노랑 - 부분 조명 |
| Blood Red | `#8B0000` | 다크 레드 - 위험/피 표현 |
| Mist Purple | `#2D1B4E` | 안개 보라 - 미스터리 분위기 |
| Poison Green | `#2ECC40` | 독 녹색 - 유독/마법 이펙트 |

---

## UI 스타일 가이드

### 버튼 스타일

- **일반 버튼**: `Background(Surface)` 배경 + `Primary(금색)` 1px 테두리 + `Text Primary` 텍스트. 호버 시 테두리 2px + 미세한 금색 글로우.
- **강조 버튼 (CTA)**: `Accent(선홍색)` 배경 + 2px `Primary(금색)` 테두리 + 흰색 텍스트. 입장, 뽑기 등 주요 액션에 사용. 미세한 펄스 애니메이션.
- **위험 버튼**: `Danger` 배경 + 진한 테두리. 철수, 포기 등.
- **비활성 버튼**: 전체 50% opacity, 테두리 `Text Secondary`.
- **공통**: 모서리 라운드 `6px`, 패딩 `12px 24px`, 폰트 굵게. 모든 버튼에 미세한 `box-shadow`로 입체감 부여.

### 카드/패널 스타일

- **영웅 카드**: 세로형 카드. 상단 70% 영웅 일러스트, 하단 30% 이름 + 등급 표시. 테두리는 등급별 색상:
  - Normal(N): `#808080` 회색
  - Rare(R): `#4A90D9` 파랑
  - Epic(SR): `#9B59B6` 보라
  - Legendary(SSR): `#C8A84E` 금색 + 글로우 이펙트
- **스킬 카드**: 가로형 카드. 좌측에 아이콘, 우측에 스킬 이름 + 설명. `Background(Surface)` 배경 + 1px `Primary` 테두리. 선택 시 `Accent` 테두리 + 글로우.
- **정보 패널**: `Background(Surface)` + `Primary` 테두리 1px + 모서리 라운드 `8px`. 안쪽 패딩 `16px`.

### 폰트 방향

- **제목/로고**: 세리프 계열, 고딕/판타지 느낌. 웹 기본 시스템 폰트 중 `Georgia` 또는 Google Fonts `Cinzel` 계열. 금색(`Primary`) 컬러.
- **본문/UI 텍스트**: 산세리프 계열. `'Pretendard', 'Noto Sans KR', system-ui, sans-serif`. 가독성 우선.
- **수치/데미지 텍스트**: 모노스페이스 또는 굵은 산세리프. `font-variant-numeric: tabular-nums`.
- **크기 기준**: 제목 `24-32px`, 부제 `18-20px`, 본문 `14-16px`, 캡션 `12px`.

### 아이콘 스타일

- 라인 아이콘 기반, 금색(`Primary`) 또는 베이지(`Text Primary`) 단색.
- 선 두께 `2px`, 모서리 라운드.
- 전투 관련(칼, 방패, 물약)은 약간의 디테일 추가.
- Lucide Icons 또는 이모지 폴백 활용.

### 전투 UI 스타일

- **HP 바**: 가로 바, 높이 `8px`. 배경 `#2A2A3A`, 채움 색상은 HP 비율에 따라:
  - 50% 이상: `Success(초록)`
  - 25~50%: `#FFA500` 주황
  - 25% 미만: `Danger(빨강)` + 미세한 펄스
  - 테두리 `1px #555`.
- **데미지 텍스트**: 적에게 피해 시 `#FF4444` 빨간색, 크기 `24px`, 위로 떠올랐다 사라지는 애니메이션. 크리티컬은 `32px` + `#FFD700` 금색 + 강조 이펙트.
- **힐 텍스트**: `Success(초록)` 컬러, `+N` 형식, 위로 떠오름.
- **턴 순서 표시**: 화면 상단에 캐릭터 미니 초상화 순서 나열. 현재 턴은 금색 테두리 강조.
- **스킬 발동 표시**: 캐릭터 위에 스킬 이름 텍스트 팝업 + 이펙트 오버레이.

---

## 화면 구성

| 화면명 | 역할 | 핵심 요소 | 레이아웃 방향 |
|--------|------|----------|-------------|
| **메인 화면** (모닥불 캠프) | 게임 허브, 출격 준비 | 모닥불 배경, 캠프에 앉은 영웅 실루엣(4명 편성 슬롯), 챕터 선택(좌우 화살표 + 챕터명), 입장 버튼(CTA), 하단 네비게이션(영웅/뽑기) | 세로 중앙 배치. 상단 50%에 모닥불 일러스트 + 영웅, 중앙에 챕터 정보, 하단에 입장 버튼 + 네비 |
| **전투 화면** (횡스크롤 4:4) | 핵심 전투 | 어두운 던전 배경, 좌측 아군 4명 / 우측 적 4명 횡스크롤 배치, 상단 턴 순서 바, 각 캐릭터 아래 HP 바, 데미지/힐 텍스트 팝업, 스킬 이펙트 오버레이 | 횡스크롤. 전체 화면을 전투 뷰로 사용. 상단에 턴 순서, 중앙에 캐릭터 배치, 하단에 스테이지 진행도 + 배속 버튼 |
| **스킬 선택 화면** | 전투 승리 후 로그라이트 빌드 | 3장의 스킬 카드를 가로 나열, 각 카드에 아이콘 + 이름 + 효과 설명, 선택 시 확인 피드백 | 전투 화면 위에 반투명 오버레이. 중앙에 3장 카드 가로 배치. "스킬을 선택하세요" 상단 텍스트. |
| **이벤트 스테이지 화면** (쉼터) | 비전투 이벤트 | 쉼터 배경(모닥불 작은 버전), 이벤트 설명 텍스트, 선택지 버튼(HP 회복 등), 영웅 HP 상태 표시 | 전체 화면. 중앙에 이벤트 일러스트 + 설명, 하단에 선택지 버튼 |
| **영웅 목록 화면** | 보유 영웅 확인 + 편성 | 영웅 카드 그리드(2~3열), 각 카드 탭하면 상세 정보, 편성 슬롯(상단 4칸), 드래그 or 탭으로 편성 | 상단에 편성 슬롯 4칸 고정, 아래에 보유 영웅 그리드 스크롤 |
| **영웅 뽑기 화면** | 가챠/수집 | 뽑기 연출 영역(중앙), 뽑기 버튼(1회/10회), 보유 재화 표시, 뽑기 결과 영웅 카드 공개 연출 | 중앙에 뽑기 연출 영역(빛 이펙트), 하단에 뽑기 버튼, 상단에 재화 |
| **결과 화면** (런 종료) | 한 런의 결과 요약 | 클리어/실패 텍스트, 도달 스테이지, 획득 보상(재화, 경험치), 획득 스킬 목록, 확인 버튼 | 세로 스크롤. 상단에 결과 타이틀, 중앙에 보상 요약, 하단에 확인 버튼 |

---

## 나노바나나 프롬프트 가이드

에셋 생성 시 아래 템플릿을 기반으로 프롬프트를 작성한다. 모든 프롬프트는 **공통 스타일 프리픽스**를 앞에 붙여 일관된 스타일을 유지한다.

### 공통 스타일 프리픽스

**캐릭터용:**
```
"Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose"
```

**배경용:**
```
"Dark fantasy environment painting, atmospheric perspective, painterly brushstroke texture, dramatic lighting with deep shadows, muted desaturated color palette, wide aspect ratio, game background art, no characters"
```

**UI/아이콘용:**
```
"Dark fantasy game UI element, clean sharp design, gold and dark color scheme, slight glow effect, ornate medieval style, transparent background, high resolution icon"
```

**이펙트용:**
```
"Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration"
```

### 에셋 목록 및 프롬프트

#### 영웅 캐릭터 (P0 - 최우선)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| hero_warrior.png | 전사 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A muscular human male knight warrior in heavy dark steel plate armor with golden trim, wielding a large broadsword, scarred face with determined expression, short dark hair, red tattered cape flowing behind, battle-worn shield on back, facing right in combat-ready stance | 512x768 | P0 |
| hero_mage.png | 마법사 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A mysterious female elven mage in dark purple flowing robes with silver arcane runes, holding a twisted wooden staff topped with a glowing blue crystal, pale skin, long silver-white hair with braids, glowing blue eyes, mystical energy swirling around her free hand, facing right | 512x768 | P0 |
| hero_archer.png | 궁수 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A nimble female human ranger archer in dark green leather armor with brown fur trim, holding a ornate longbow, quiver of arrows on back, auburn hair in a ponytail, sharp focused eyes, hooded cloak partially covering face, agile combat stance facing right | 512x768 | P0 |
| hero_healer.png | 힐러 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A gentle male human cleric healer in white and gold ornate robes with holy symbols, holding a golden censer emitting soft warm light, kind weathered face with short beard, bald head with religious tattoos, warm golden aura surrounding him, facing right | 512x768 | P0 |
| hero_assassin.png | 어쌔신 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A deadly female dark elf assassin rogue in tight black leather armor with crimson accents, dual wielding curved daggers with poison-dripping blades, dark skin, white short spiky hair, red glowing eyes, shadowy wisps emanating from her body, crouching combat pose facing right | 512x768 | P0 |
| hero_paladin.png | 팔라딘 영웅 (전투/카드) | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style but with more vibrant character appeal, game character art, transparent background, full body standing pose. A towering male dwarf paladin in gleaming white and gold heavy armor with holy engravings, wielding a massive warhammer radiating divine light, thick braided red beard, stern noble expression, heavy tower shield with sun emblem on back, divine halo faintly visible, facing right | 512x768 | P0 |

#### 적 캐릭터 (P0 - 최우선)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| enemy_skeleton.png | 일반 몹 - 스켈레톤 | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style, game character art, transparent background. A menacing undead skeleton warrior in rusted broken armor fragments, wielding a jagged notched sword, glowing red eyes in hollow skull, dark miasma seeping from bones, hunched aggressive pose facing left, eerie green-tinged lighting | 512x768 | P0 |
| enemy_goblin.png | 일반 몹 - 고블린 | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style, game character art, transparent background. A grotesque goblin creature with sickly green mottled skin, oversized pointed ears, yellow beady eyes, wearing crude leather scraps and bone necklace, clutching a rusty dagger and a stolen coin pouch, malicious grin showing sharp teeth, crouching stance facing left | 512x768 | P0 |
| enemy_darkKnight.png | 엘리트 몹 - 다크나이트 | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style, game character art, transparent background. A corrupted dark knight in pitch-black spiked full plate armor with glowing crimson veins running through the metal, wielding a massive cursed greatsword emanating dark smoke, faceless horned helmet with red glowing visor slit, towering imposing figure, dark aura radiating power, facing left, larger than normal human | 512x768 | P0 |
| enemy_boss_lich.png | 보스 - 리치 | Dark fantasy semi-realistic illustration style, bold ink outlines, rich color shading, painterly texture, dramatic lighting, high contrast, inspired by Darkest Dungeon art style, game character art, transparent background. A terrifying ancient lich necromancer boss, skeletal figure in tattered regal dark purple and black robes with gold arcane symbols, floating slightly above ground, holding a skull-topped staff crackling with dark purple necrotic energy, crown of black thorns on skull head, hollow eye sockets blazing with intense purple fire, surrounded by swirling souls and dark magic particles, imposing and powerful presence, facing left, slightly larger scale than regular enemies | 640x896 | P0 |

#### 배경 (P0 - 최우선)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| bg_campfire.png | 메인 화면 배경 - 모닥불 캠프 | Dark fantasy environment painting, atmospheric perspective, painterly brushstroke texture, dramatic lighting with deep shadows, game background art, no characters. A warm and cozy campfire rest area in a dark forest clearing at night, large crackling bonfire in the center casting warm orange and amber light, scattered adventuring supplies and bedrolls around the fire, tall dark pine trees surrounding the clearing, starry night sky visible through the canopy, fireflies and floating embers in the air, stone circle around the fire pit, warm inviting atmosphere contrasting with the dark mysterious forest beyond, wide panoramic view | 1920x1080 | P0 |
| bg_dungeon_battle.png | 전투 화면 배경 - 던전 내부 | Dark fantasy environment painting, atmospheric perspective, painterly brushstroke texture, dramatic lighting with deep shadows, game background art, no characters. A dark and foreboding dungeon corridor interior, ancient stone walls covered in cracks and moss, dim flickering torchlight casting long shadows on the walls, scattered bones and broken weapons on the ground, mysterious glowing runes carved into pillars, cobwebs in corners, dripping water, ominous fog rolling along the floor, oppressive claustrophobic atmosphere, side-scrolling perspective view, horizontally tileable seamless edges | 1920x600 | P0 |

#### 배경 추가 (P1)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| bg_rest_event.png | 이벤트 스테이지 배경 - 쉼터 | Dark fantasy environment painting, atmospheric perspective, painterly brushstroke texture, dramatic lighting with deep shadows, game background art, no characters. A small safe haven alcove inside a dungeon, a tiny campfire providing warm light in a stone alcove, a natural spring with clean glowing water nearby, some medicinal herbs growing from cracks in the walls, a sense of temporary safety and respite amidst the darkness, soft warm lighting mixing with cool dungeon tones, peaceful but still underground atmosphere | 1920x1080 | P1 |
| bg_gacha.png | 뽑기 화면 배경 | Dark fantasy environment painting, atmospheric perspective, painterly brushstroke texture, dramatic lighting, game background art, no characters. A mystical summoning chamber with a large ornate magic circle glowing on the stone floor, tall gothic pillars reaching into darkness above, swirling arcane energy and magical particles in the air, ancient tomes and crystals floating around the circle, dramatic upward lighting from the summoning circle in gold and purple hues, sense of powerful ancient magic, centered symmetrical composition | 1920x1080 | P1 |

#### UI 요소 (P1)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| ui_skill_card_frame.png | 스킬 카드 프레임 | Dark fantasy game UI element, clean sharp design, gold and dark color scheme, slight glow effect, ornate medieval style, transparent background, high resolution. An ornate rectangular card frame border for a skill card, dark metal with gold filigree edges, subtle magical rune engravings along the border, inner area is empty/transparent for content, gothic medieval fantasy style, elegant but not overly busy, slight golden glow on edges | 300x420 | P1 |
| ui_hero_card_frame_ssr.png | SSR 등급 영웅 카드 프레임 | Dark fantasy game UI element, clean sharp design, gold color scheme, ornate medieval style, transparent background, high resolution. A luxurious portrait card frame border for a legendary hero card, rich gold ornate border with diamond-shaped gems at corners, magical golden energy wisps emanating from edges, inner area is empty/transparent, radiant prestigious feeling, gleaming metallic gold texture | 256x360 | P1 |
| ui_hero_card_frame_sr.png | SR 등급 영웅 카드 프레임 | Dark fantasy game UI element, clean sharp design, purple and silver color scheme, ornate medieval style, transparent background, high resolution. An elegant portrait card frame border for an epic hero card, purple crystalline border with silver accents, subtle purple magical glow on edges, inner area is empty/transparent, mystical prestigious feeling | 256x360 | P1 |
| ui_hero_card_frame_r.png | R 등급 영웅 카드 프레임 | Dark fantasy game UI element, clean sharp design, blue and silver color scheme, medieval style, transparent background, high resolution. A refined portrait card frame border for a rare hero card, blue steel border with subtle silver engravings, slight blue shimmer effect, inner area is empty/transparent, solid dependable feeling | 256x360 | P1 |
| ui_hero_card_frame_n.png | N 등급 영웅 카드 프레임 | Dark fantasy game UI element, clean sharp design, gray color scheme, simple medieval style, transparent background, high resolution. A simple portrait card frame border for a normal hero card, plain dark iron border with minimal engravings, weathered metal texture, inner area is empty/transparent, basic functional appearance | 256x360 | P1 |
| ui_icon_sword.png | 공격력 아이콘 | Dark fantasy game UI element, transparent background, high resolution icon. A stylized medieval broadsword icon, silver blade with golden cross-guard, clean sharp design, slight glow, centered, top-down view | 64x64 | P1 |
| ui_icon_shield.png | 방어력 아이콘 | Dark fantasy game UI element, transparent background, high resolution icon. A stylized medieval kite shield icon, dark steel with golden emblem in center, clean sharp design, slight glow, centered, front view | 64x64 | P1 |
| ui_icon_heart.png | HP 아이콘 | Dark fantasy game UI element, transparent background, high resolution icon. A stylized heart icon for health points, deep red crystal heart with golden outline, slight inner glow, clean sharp design, centered | 64x64 | P1 |
| ui_icon_speed.png | 속도 아이콘 | Dark fantasy game UI element, transparent background, high resolution icon. A stylized wing icon for speed stat, silver feathered wing, dynamic motion feeling, clean sharp design, slight blue glow, centered | 64x64 | P1 |
| ui_icon_gold.png | 골드 재화 아이콘 | Dark fantasy game UI element, transparent background, high resolution icon. A pile of gold coins icon, shiny stacked golden coins with medieval stamped designs, warm golden glow, clean sharp design, centered | 64x64 | P1 |
| ui_icon_gem.png | 보석 재화 아이콘 (뽑기용) | Dark fantasy game UI element, transparent background, high resolution icon. A magical purple crystal gem icon, faceted amethyst gemstone radiating purple magical energy, slight sparkle effect, clean sharp design, centered | 64x64 | P1 |

#### 이펙트 (P1)

| 에셋명 | 용도 | 프롬프트 | 크기 | 우선순위 |
|--------|------|---------|------|---------|
| fx_slash.png | 물리 공격 이펙트 - 베기 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, stylized illustration. A dynamic sword slash effect, sharp white and light blue energy arc cutting through the air, speed lines, bright flash at the center of impact, motion blur trailing edge, dramatic and powerful feeling | 256x256 | P1 |
| fx_magic_fire.png | 마법 공격 이펙트 - 화염 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration. A burst of magical fire spell effect, intense orange and red flames with golden sparks, swirling fire vortex, bright white-hot center, embers scattering outward, dramatic magical explosion | 256x256 | P1 |
| fx_magic_ice.png | 마법 공격 이펙트 - 빙결 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration. A burst of ice magic spell effect, sharp crystalline ice shards radiating outward, cool blue and white frost energy, snowflake particles, freezing mist, cold blue glow at center | 256x256 | P1 |
| fx_heal.png | 힐 이펙트 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration. A warm healing spell effect, soft green and golden light rising upward, gentle leaf-like particles and sparkles floating up, warm divine glow, soothing magical energy wisps, holy cross or plus symbol faintly visible in the light | 256x256 | P1 |
| fx_poison.png | 독/디버프 이펙트 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration. A dark poison debuff effect, sickly green and purple toxic bubbles and dripping liquid, noxious gas wisps rising, skull shape faintly visible in the mist, corrosive and dangerous feeling | 256x256 | P1 |
| fx_critical.png | 크리티컬 히트 이펙트 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, stylized illustration. A powerful critical hit impact burst effect, explosive golden and white energy starburst, radiating sharp light rays, dynamic impact cracks, intense power feeling, bright flash at center | 256x256 | P1 |
| fx_summon_glow.png | 뽑기 소환 이펙트 | Fantasy game visual effect, glowing energy, transparent background, vibrant color, magical particle effect, stylized illustration. A magical summoning portal effect, swirling golden and purple arcane energy ring, bright light emanating from center, magical rune symbols orbiting around, sparkle particles, ethereal and mystical atmosphere, dramatic summoning ritual feeling | 512x512 | P1 |

---

## 폴백 전략 (에셋 생성 실패 시)

나노바나나 API 호출이 실패하거나 품질이 부적합할 경우 아래 순서로 대체한다:

| 에셋 유형 | 1차 폴백 | 2차 폴백 | 3차 폴백 |
|----------|----------|----------|----------|
| 영웅 캐릭터 | 이모지 + CSS 그래디언트 원형 아바타 (예: 전사 = 검 이모지 + 빨간 그래디언트) | SVG 실루엣 | 컬러 이니셜 박스 |
| 적 캐릭터 | 이모지 + CSS 그래디언트 (예: 스켈레톤 = 해골 이모지 + 회색 그래디언트) | SVG 실루엣 | 컬러 이니셜 박스 |
| 배경 | CSS 그래디언트 배경 (캠프: 갈색/주황 그래디언트, 던전: 남색/검정 그래디언트) | 단색 + 패턴(CSS repeating-linear-gradient) | 단색 배경 |
| UI 프레임 | CSS border + box-shadow로 프레임 표현 | 없음 (CSS만으로 충분) | - |
| 이펙트 | CSS animation (scale + opacity + color) | 이모지 + 애니메이션 | 텍스트만 표시 |

### 폴백용 이모지 매핑

| 에셋 | 이모지 |
|------|--------|
| 전사 | 🗡️ |
| 마법사 | 🔮 |
| 궁수 | 🏹 |
| 힐러 | ✨ |
| 어쌔신 | 🗡️ |
| 팔라딘 | 🛡️ |
| 스켈레톤 | 💀 |
| 고블린 | 👺 |
| 다크나이트 | ⚔️ |
| 리치(보스) | 👿 |
| 물리 공격 | 💥 |
| 마법 공격(화) | 🔥 |
| 마법 공격(빙) | ❄️ |
| 힐 | 💚 |
| 독 | ☠️ |
| 크리티컬 | ⭐ |
| 골드 | 🪙 |
| 보석 | 💎 |
