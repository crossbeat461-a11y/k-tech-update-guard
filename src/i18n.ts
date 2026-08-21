export type Locale =
  | "en"
  | "ja"
  | "zh-cn"
  | "zh-tw"
  | "ko"
  | "es"
  | "de"
  | "fr"
  | "pt"
  | "ru";

type Vars = Record<string, string | number>;

type Messages = {
  thanksInstall: string;
  updatedTo: string;
  thanksInstallBody: string;
  thanksUpdateBody: string;
  bmc: string;
  later: string;
  noUpdatesTitle: string;
  noUpdatesBody: string;
  close: string;
  updatesTitle: string;
  updatesBody: string;
  selectAll: string;
  beta: string;
  updateSelected: string;
  cancel: string;
  noneSelected: string;
  updating: string;
  rateLimitedShort: string;
  updatedCount: string;
  statusCheck: string;
  cmdCheck: string;
  alreadyChecking: string;
  statusChecking: string;
  checkingNotice: string;
  rateLimitedLong: string;
  statusUpToDate: string;
  statusError: string;
  checkFailed: string;
  checkOnStartup: string;
  checkOnStartupDesc: string;
  ignoreDisabled: string;
  ignoreDisabledDesc: string;
  hideBeta: string;
  hideBetaDesc: string;
  daysWait: string;
  daysWaitDesc: string;
  lazyHandling: string;
  lazyHandlingDesc: string;
  lazyReadConfig: string;
  lazyWaitLoaded: string;
  lazyFixedDelay: string;
  lazyNone: string;
  waitSeconds: string;
  waitTimeout: string;
  githubToken: string;
  githubTokenDesc: string;
  supportOptional: string;
  selfUpdatedReload: string;
  missingReleaseFiles: string;
  installVerifyFailed: string;
};

const en: Messages = {
  thanksInstall: "Thanks for installing!",
  updatedTo: "Updated to {version}",
  thanksInstallBody:
    "Check community updates, then install only what you select. If this helps, consider supporting development (optional).",
  thanksUpdateBody:
    "Thanks for updating. If this helps your workflow, consider supporting development (optional).",
  bmc: "Buy Me a Coffee",
  later: "Maybe later",
  noUpdatesTitle: "No updates right now",
  noUpdatesBody: "Installed community items are up to date for this check.",
  close: "Close",
  updatesTitle: "{count} update(s) available",
  updatesBody:
    "Select what to install. Files come from each GitHub Release (same as the official updater).",
  selectAll: "Select all",
  beta: " (beta)",
  updateSelected: "Update selected",
  cancel: "Cancel",
  noneSelected: "Nothing selected",
  updating: "Updating {name}…",
  rateLimitedShort: "GitHub rate limit reached",
  updatedCount: "Updated {count} item(s)",
  statusCheck: "Check",
  cmdCheck: "Check for updates",
  alreadyChecking: "Already checking",
  statusChecking: "Checking…",
  checkingNotice: "Checking for updates…",
  rateLimitedLong:
    "GitHub rate limit reached. The official community installer uses the same GitHub limit. Add a token in settings, or wait about an hour.",
  statusUpToDate: "Up to date",
  statusError: "Error",
  checkFailed: "Check failed: {error}",
  checkOnStartup: "Check on startup",
  checkOnStartupDesc: "When off, GitHub is contacted only from the button or command.",
  ignoreDisabled: "Ignore disabled items",
  ignoreDisabledDesc:
    "With Lazy Loader, only items it marks Disabled are skipped. Delayed items stay included.",
  hideBeta: "Hide beta versions",
  hideBetaDesc:
    "Hides GitHub prereleases and releases whose name or notes say beta, alpha, or rc.",
  daysWait: "Days to wait after a release",
  daysWaitDesc: "0 shows a release as soon as this check finds it.",
  lazyHandling: "Delayed loading",
  lazyHandlingDesc:
    "Avoid treating Lazy Loader delayed items as disabled.",
  lazyReadConfig: "Read Lazy Loader settings (recommended)",
  lazyWaitLoaded: "Wait until delayed items load",
  lazyFixedDelay: "Wait a fixed number of seconds",
  lazyNone: "Do not wait",
  waitSeconds: "Wait seconds",
  waitTimeout: "Wait timeout (seconds)",
  githubToken: "GitHub token (optional)",
  githubTokenDesc:
    "Without a token, GitHub allows about 60 API requests per hour for this network — shared with the official community installer. A PAT is stored locally only and is never sent to a K-Tech server.",
  supportOptional: "Support is optional.",
  selfUpdatedReload: "K-Tech Update Guard was updated. Reloading…",
  missingReleaseFiles: "Release is missing main.js or manifest.json",
  installVerifyFailed:
    "Wrote files for {name}, but the installed version is still {version}.",
};

const ja: Messages = {
  thanksInstall: "インストールありがとうございます",
  updatedTo: "{version} に更新しました",
  thanksInstallBody:
    "コミュニティの更新を、選んでから入れられます。役に立ったら開発の励みにしてください（任意）。",
  thanksUpdateBody:
    "新しい版に更新されました。役に立ったら、開発の励みにしてください（任意）。",
  bmc: "Buy Me a Coffee",
  later: "あとで",
  noUpdatesTitle: "今のところ更新はありません",
  noUpdatesBody: "導入しているコミュニティ項目は、確認した範囲では最新です。",
  close: "閉じる",
  updatesTitle: "{count} 件の更新があります",
  updatesBody:
    "入れるものにチェックを付けてから更新してください。GitHub Release の配布ファイルを使います。",
  selectAll: "すべて選択",
  beta: "（ベータ）",
  updateSelected: "選択した項目を更新",
  cancel: "キャンセル",
  noneSelected: "選択されていません",
  updating: "{name} を更新しています…",
  rateLimitedShort: "GitHub の回数制限に達しました",
  updatedCount: "{count} 件を更新しました",
  statusCheck: "確認",
  cmdCheck: "更新を確認",
  alreadyChecking: "すでに確認中です",
  statusChecking: "確認中…",
  checkingNotice: "更新を確認しています…",
  rateLimitedLong:
    "GitHub の回数制限に達しました。公式のコミュニティプラグインのインストールも同じ制限です。設定にトークンを入れるか、1時間ほど待ってください。",
  statusUpToDate: "最新",
  statusError: "エラー",
  checkFailed: "確認に失敗しました: {error}",
  checkOnStartup: "起動時に確認する",
  checkOnStartupDesc: "オフのときは、ボタンまたはコマンドでのみ GitHub を見に行きます。",
  ignoreDisabled: "無効の項目は対象外",
  ignoreDisabledDesc:
    "Lazy Loader があるときは、そちらの「無効」だけを無効とみなします（遅延読み込みは対象に残します）。",
  hideBeta: "ベータ版を出さない",
  hideBetaDesc:
    "GitHub のプレリリースと、名前やリリースノートに beta / alpha / rc とあるものを出さない。",
  daysWait: "公開から何日待つか",
  daysWaitDesc: "0 なら、確認した時点の最新を出します。",
  lazyHandling: "遅延読み込みの扱い",
  lazyHandlingDesc:
    "Lazy Loader 利用時に、まだ読み込まれていない項目を無効と誤らないための方法です。",
  lazyReadConfig: "Lazy Loader の設定を読む（推奨）",
  lazyWaitLoaded: "読み込み完了まで待つ",
  lazyFixedDelay: "固定秒数待つ",
  lazyNone: "待たない",
  waitSeconds: "待機秒数",
  waitTimeout: "待ち時間の上限（秒）",
  githubToken: "GitHub トークン（任意）",
  githubTokenDesc:
    "トークンなしは、この回線で GitHub API が1時間あたり約60回です。公式のコミュニティ導入も同じ回数です。PAT は端末内のみで、作者サーバーには送りません。",
  supportOptional: "開発支援は任意です。",
  selfUpdatedReload: "K-Tech Update Guard を更新しました。再読み込みします…",
  missingReleaseFiles: "リリースに main.js または manifest.json がありません",
  installVerifyFailed:
    "{name} のファイルは書きましたが、バージョンはまだ {version} です。",
};

const zhCn: Messages = {
  thanksInstall: "感谢安装！",
  updatedTo: "已更新到 {version}",
  thanksInstallBody:
    "可先检查社区更新，再只安装你勾选的项目。如果有帮助，欢迎支持开发（可选）。",
  thanksUpdateBody: "已更新。如果对你有帮助，欢迎支持开发（可选）。",
  bmc: "Buy Me a Coffee",
  later: "以后再说",
  noUpdatesTitle: "目前没有更新",
  noUpdatesBody: "这次检查中，已安装的社区项目都是最新的。",
  close: "关闭",
  updatesTitle: "有 {count} 个更新",
  updatesBody: "勾选要安装的项目。文件来自各 GitHub Release（与官方更新相同）。",
  selectAll: "全选",
  beta: "（测试版）",
  updateSelected: "更新所选",
  cancel: "取消",
  noneSelected: "尚未选择",
  updating: "正在更新 {name}…",
  rateLimitedShort: "已达到 GitHub 请求上限",
  updatedCount: "已更新 {count} 项",
  statusCheck: "检查",
  cmdCheck: "检查更新",
  alreadyChecking: "正在检查",
  statusChecking: "检查中…",
  checkingNotice: "正在检查更新…",
  rateLimitedLong: "已达到 GitHub 请求上限。请在设置中添加令牌，或稍后再试。",
  statusUpToDate: "已是最新",
  statusError: "错误",
  checkFailed: "检查失败：{error}",
  checkOnStartup: "启动时检查",
  checkOnStartupDesc: "关闭后，仅在点击按钮或命令时访问 GitHub。",
  ignoreDisabled: "忽略已禁用项",
  ignoreDisabledDesc:
    "若使用 Lazy Loader，仅将其中标记为禁用的项目排除。延迟加载的项目仍会包含。",
  hideBeta: "隐藏测试版",
  hideBetaDesc: "隐藏 GitHub 预发布，以及名称或说明中含 beta / alpha / rc 的版本。",
  daysWait: "发布后等待天数",
  daysWaitDesc: "0 表示本次检查一发现就显示。",
  lazyHandling: "延迟加载处理",
  lazyHandlingDesc: "避免把 Lazy Loader 尚未加载的项目当成已禁用。",
  lazyReadConfig: "读取 Lazy Loader 设置（推荐）",
  lazyWaitLoaded: "等到延迟项加载完成",
  lazyFixedDelay: "固定等待秒数",
  lazyNone: "不等待",
  waitSeconds: "等待秒数",
  waitTimeout: "等待上限（秒）",
  githubToken: "GitHub 令牌（可选）",
  githubTokenDesc:
    "未认证时每小时约 60 次请求。PAT 只保存在本地，不会发到 K-Tech 服务器。",
  supportOptional: "支持开发为可选项。",
  selfUpdatedReload: "K-Tech Update Guard 已更新。正在重新加载…",
  missingReleaseFiles: "该 Release 缺少 main.js 或 manifest.json",
  installVerifyFailed: "已写入 {name} 的文件，但安装版本仍为 {version}。",
};

const zhTw: Messages = {
  thanksInstall: "感謝安裝！",
  updatedTo: "已更新到 {version}",
  thanksInstallBody:
    "可先檢查社群更新，再只安裝你勾選的項目。如果有幫助，歡迎支持開發（選用）。",
  thanksUpdateBody: "已更新。如果對你有幫助，歡迎支持開發（選用）。",
  bmc: "Buy Me a Coffee",
  later: "稍後再說",
  noUpdatesTitle: "目前沒有更新",
  noUpdatesBody: "這次檢查中，已安裝的社群項目都是最新的。",
  close: "關閉",
  updatesTitle: "有 {count} 個更新",
  updatesBody: "勾選要安裝的項目。檔案來自各 GitHub Release（與官方更新相同）。",
  selectAll: "全選",
  beta: "（測試版）",
  updateSelected: "更新所選",
  cancel: "取消",
  noneSelected: "尚未選擇",
  updating: "正在更新 {name}…",
  rateLimitedShort: "已達 GitHub 請求上限",
  updatedCount: "已更新 {count} 項",
  statusCheck: "檢查",
  cmdCheck: "檢查更新",
  alreadyChecking: "正在檢查",
  statusChecking: "檢查中…",
  checkingNotice: "正在檢查更新…",
  rateLimitedLong: "已達 GitHub 請求上限。請在設定中新增權杖，或稍後再試。",
  statusUpToDate: "已是最新",
  statusError: "錯誤",
  checkFailed: "檢查失敗：{error}",
  checkOnStartup: "啟動時檢查",
  checkOnStartupDesc: "關閉後，僅在按下按鈕或指令時連線 GitHub。",
  ignoreDisabled: "忽略已停用項目",
  ignoreDisabledDesc:
    "若使用 Lazy Loader，只排除其中標記為停用的項目。延遲載入的項目仍會包含。",
  hideBeta: "隱藏測試版",
  hideBetaDesc: "隱藏 GitHub 預發布，以及名稱或說明中含 beta / alpha / rc 的版本。",
  daysWait: "發布後等待天數",
  daysWaitDesc: "0 表示這次檢查一發現就顯示。",
  lazyHandling: "延遲載入處理",
  lazyHandlingDesc: "避免把 Lazy Loader 尚未載入的項目當成已停用。",
  lazyReadConfig: "讀取 Lazy Loader 設定（建議）",
  lazyWaitLoaded: "等到延遲項目載入完成",
  lazyFixedDelay: "固定等待秒數",
  lazyNone: "不等待",
  waitSeconds: "等待秒數",
  waitTimeout: "等待上限（秒）",
  githubToken: "GitHub 權杖（選用）",
  githubTokenDesc:
    "未驗證時每小時約 60 次請求。PAT 只存在本機，不會送到 K-Tech 伺服器。",
  supportOptional: "支持開發為選用。",
  selfUpdatedReload: "K-Tech Update Guard 已更新。正在重新載入…",
  missingReleaseFiles: "此 Release 缺少 main.js 或 manifest.json",
  installVerifyFailed: "已寫入 {name} 的檔案，但安裝版本仍為 {version}。",
};

const ko: Messages = {
  thanksInstall: "설치해 주셔서 감사합니다!",
  updatedTo: "{version}(으)로 업데이트했습니다",
  thanksInstallBody:
    "커뮤니티 업데이트를 확인한 뒤 선택한 항목만 설치할 수 있습니다. 도움이 되었다면 개발 지원을 고려해 주세요(선택).",
  thanksUpdateBody:
    "업데이트되었습니다. 도움이 되었다면 개발 지원을 고려해 주세요(선택).",
  bmc: "Buy Me a Coffee",
  later: "나중에",
  noUpdatesTitle: "지금은 업데이트가 없습니다",
  noUpdatesBody: "이번 확인 기준, 설치된 커뮤니티 항목은 최신입니다.",
  close: "닫기",
  updatesTitle: "업데이트 {count}개",
  updatesBody:
    "설치할 항목을 선택한 뒤 업데이트하세요. 파일은 각 GitHub Release에서 가져옵니다.",
  selectAll: "모두 선택",
  beta: " (베타)",
  updateSelected: "선택한 항목 업데이트",
  cancel: "취소",
  noneSelected: "선택된 항목이 없습니다",
  updating: "{name} 업데이트 중…",
  rateLimitedShort: "GitHub 요청 한도에 도달했습니다",
  updatedCount: "{count}개를 업데이트했습니다",
  statusCheck: "확인",
  cmdCheck: "업데이트 확인",
  alreadyChecking: "이미 확인 중입니다",
  statusChecking: "확인 중…",
  checkingNotice: "업데이트를 확인하는 중…",
  rateLimitedLong:
    "GitHub 요청 한도에 도달했습니다. 설정에 토큰을 추가하거나 잠시 후 다시 시도하세요.",
  statusUpToDate: "최신",
  statusError: "오류",
  checkFailed: "확인 실패: {error}",
  checkOnStartup: "시작 시 확인",
  checkOnStartupDesc: "끄면 버튼이나 명령으로만 GitHub에 접속합니다.",
  ignoreDisabled: "비활성 항목 제외",
  ignoreDisabledDesc:
    "Lazy Loader가 있으면 거기서 비활성으로 표시한 항목만 건너뜁니다. 지연 로드 항목은 포함됩니다.",
  hideBeta: "베타 버전 숨기기",
  hideBetaDesc:
    "GitHub 사전 릴리스와 이름·노트에 beta / alpha / rc가 있는 버전을 숨깁니다.",
  daysWait: "출시 후 대기 일수",
  daysWaitDesc: "0이면 이번 확인에서 발견되는 즉시 표시합니다.",
  lazyHandling: "지연 로드 처리",
  lazyHandlingDesc: "Lazy Loader가 아직 불러오지 않은 항목을 비활성으로 오인하지 않습니다.",
  lazyReadConfig: "Lazy Loader 설정 읽기(권장)",
  lazyWaitLoaded: "지연 항목이 로드될 때까지 대기",
  lazyFixedDelay: "고정 초 대기",
  lazyNone: "대기하지 않음",
  waitSeconds: "대기 초",
  waitTimeout: "대기 제한(초)",
  githubToken: "GitHub 토큰(선택)",
  githubTokenDesc:
    "인증 없이는 시간당 약 60회입니다. PAT는 기기에만 저장되며 K-Tech 서버로 보내지지 않습니다.",
  supportOptional: "후원은 선택 사항입니다.",
  selfUpdatedReload: "K-Tech Update Guard가 업데이트되었습니다. 다시 불러오는 중…",
  missingReleaseFiles: "릴리스에 main.js 또는 manifest.json이 없습니다",
  installVerifyFailed: "{name} 파일을 썼지만 설치된 버전은 아직 {version}입니다.",
};

const es: Messages = {
  thanksInstall: "¡Gracias por instalar!",
  updatedTo: "Actualizado a {version}",
  thanksInstallBody:
    "Consulta las actualizaciones de la comunidad e instala solo lo que elijas. Si te ayuda, considera apoyar el desarrollo (opcional).",
  thanksUpdateBody:
    "Gracias por actualizar. Si te ayuda, considera apoyar el desarrollo (opcional).",
  bmc: "Buy Me a Coffee",
  later: "Más tarde",
  noUpdatesTitle: "No hay actualizaciones ahora",
  noUpdatesBody: "En esta comprobación, lo instalado de la comunidad está al día.",
  close: "Cerrar",
  updatesTitle: "{count} actualización(es) disponible(s)",
  updatesBody:
    "Elige qué instalar. Los archivos salen de cada GitHub Release (igual que el actualizador oficial).",
  selectAll: "Seleccionar todo",
  beta: " (beta)",
  updateSelected: "Actualizar selección",
  cancel: "Cancelar",
  noneSelected: "Nada seleccionado",
  updating: "Actualizando {name}…",
  rateLimitedShort: "Límite de GitHub alcanzado",
  updatedCount: "Se actualizaron {count} elemento(s)",
  statusCheck: "Comprobar",
  cmdCheck: "Buscar actualizaciones",
  alreadyChecking: "Ya se está comprobando",
  statusChecking: "Comprobando…",
  checkingNotice: "Buscando actualizaciones…",
  rateLimitedLong:
    "Límite de GitHub alcanzado. Añade un token en ajustes o inténtalo más tarde.",
  statusUpToDate: "Al día",
  statusError: "Error",
  checkFailed: "Error al comprobar: {error}",
  checkOnStartup: "Comprobar al iniciar",
  checkOnStartupDesc: "Si está desactivado, GitHub solo se consulta con el botón o el comando.",
  ignoreDisabled: "Ignorar desactivados",
  ignoreDisabledDesc:
    "Con Lazy Loader, solo se omiten los marcados como Disabled. Los de carga diferida se incluyen.",
  hideBeta: "Ocultar versiones beta",
  hideBetaDesc:
    "Oculta prereleases de GitHub y versiones cuyo nombre o notas dicen beta, alpha o rc.",
  daysWait: "Días de espera tras el lanzamiento",
  daysWaitDesc: "0 muestra una versión en cuanto esta comprobación la encuentra.",
  lazyHandling: "Carga diferida",
  lazyHandlingDesc: "Evita tratar como desactivados los elementos aún no cargados por Lazy Loader.",
  lazyReadConfig: "Leer ajustes de Lazy Loader (recomendado)",
  lazyWaitLoaded: "Esperar a que carguen",
  lazyFixedDelay: "Esperar un número fijo de segundos",
  lazyNone: "No esperar",
  waitSeconds: "Segundos de espera",
  waitTimeout: "Tiempo máximo (segundos)",
  githubToken: "Token de GitHub (opcional)",
  githubTokenDesc:
    "Sin autenticar hay unas 60 peticiones por hora. El PAT se guarda solo en local, no se envía a un servidor de K-Tech.",
  supportOptional: "El apoyo es opcional.",
  selfUpdatedReload: "K-Tech Update Guard se actualizó. Recargando…",
  missingReleaseFiles: "Falta main.js o manifest.json en la release",
  installVerifyFailed:
    "Se escribieron archivos de {name}, pero la versión instalada sigue siendo {version}.",
};

const de: Messages = {
  thanksInstall: "Danke fürs Installieren!",
  updatedTo: "Aktualisiert auf {version}",
  thanksInstallBody:
    "Community-Updates prüfen und nur Ausgewähltes installieren. Wenn es hilft, unterstütze gern die Entwicklung (optional).",
  thanksUpdateBody:
    "Danke fürs Update. Wenn es hilft, unterstütze gern die Entwicklung (optional).",
  bmc: "Buy Me a Coffee",
  later: "Später",
  noUpdatesTitle: "Derzeit keine Updates",
  noUpdatesBody: "Die installierten Community-Einträge sind bei dieser Prüfung aktuell.",
  close: "Schließen",
  updatesTitle: "{count} Update(s) verfügbar",
  updatesBody:
    "Wähle aus, was installiert werden soll. Dateien kommen von GitHub Releases (wie der offizielle Updater).",
  selectAll: "Alle auswählen",
  beta: " (Beta)",
  updateSelected: "Auswahl aktualisieren",
  cancel: "Abbrechen",
  noneSelected: "Nichts ausgewählt",
  updating: "{name} wird aktualisiert…",
  rateLimitedShort: "GitHub-Limit erreicht",
  updatedCount: "{count} Eintrag/Einträge aktualisiert",
  statusCheck: "Prüfen",
  cmdCheck: "Updates prüfen",
  alreadyChecking: "Prüfung läuft bereits",
  statusChecking: "Prüfe…",
  checkingNotice: "Suche nach Updates…",
  rateLimitedLong:
    "GitHub-Limit erreicht. Token in den Einstellungen hinterlegen oder später erneut versuchen.",
  statusUpToDate: "Aktuell",
  statusError: "Fehler",
  checkFailed: "Prüfung fehlgeschlagen: {error}",
  checkOnStartup: "Beim Start prüfen",
  checkOnStartupDesc: "Wenn aus, wird GitHub nur per Schaltfläche oder Befehl abgefragt.",
  ignoreDisabled: "Deaktivierte ignorieren",
  ignoreDisabledDesc:
    "Mit Lazy Loader gelten nur dort als Disabled markierte Einträge als deaktiviert. Verzögerte bleiben dabei.",
  hideBeta: "Beta-Versionen ausblenden",
  hideBetaDesc:
    "Blendet GitHub-Prereleases und Versionen aus, deren Name oder Notizen beta, alpha oder rc enthalten.",
  daysWait: "Tage nach Veröffentlichung warten",
  daysWaitDesc: "0 zeigt ein Release, sobald diese Prüfung es findet.",
  lazyHandling: "Verzögertes Laden",
  lazyHandlingDesc: "Verhindert, dass noch nicht geladene Lazy-Loader-Einträge als deaktiviert gelten.",
  lazyReadConfig: "Lazy-Loader-Einstellungen lesen (empfohlen)",
  lazyWaitLoaded: "Warten, bis verzögerte Einträge geladen sind",
  lazyFixedDelay: "Feste Sekundenzahl warten",
  lazyNone: "Nicht warten",
  waitSeconds: "Wartezeit in Sekunden",
  waitTimeout: "Warte-Timeout (Sekunden)",
  githubToken: "GitHub-Token (optional)",
  githubTokenDesc:
    "Ohne Anmeldung etwa 60 Anfragen pro Stunde. Ein PAT bleibt nur lokal und geht nicht an einen K-Tech-Server.",
  supportOptional: "Unterstützung ist optional.",
  selfUpdatedReload: "K-Tech Update Guard wurde aktualisiert. Wird neu geladen…",
  missingReleaseFiles: "Release enthält kein main.js oder manifest.json",
  installVerifyFailed:
    "Dateien für {name} wurden geschrieben, aber die installierte Version ist noch {version}.",
};

const fr: Messages = {
  thanksInstall: "Merci pour l’installation !",
  updatedTo: "Mis à jour vers {version}",
  thanksInstallBody:
    "Vérifiez les mises à jour de la communauté, puis installez seulement votre sélection. Un soutien au développement est facultatif.",
  thanksUpdateBody:
    "Merci pour la mise à jour. Un soutien au développement est facultatif.",
  bmc: "Buy Me a Coffee",
  later: "Plus tard",
  noUpdatesTitle: "Aucune mise à jour pour le moment",
  noUpdatesBody: "Pour cette vérification, les éléments communautaires installés sont à jour.",
  close: "Fermer",
  updatesTitle: "{count} mise(s) à jour disponible(s)",
  updatesBody:
    "Cochez ce qu’il faut installer. Les fichiers viennent de chaque GitHub Release (comme l’updater officiel).",
  selectAll: "Tout sélectionner",
  beta: " (bêta)",
  updateSelected: "Mettre à jour la sélection",
  cancel: "Annuler",
  noneSelected: "Rien n’est sélectionné",
  updating: "Mise à jour de {name}…",
  rateLimitedShort: "Limite GitHub atteinte",
  updatedCount: "{count} élément(s) mis à jour",
  statusCheck: "Vérifier",
  cmdCheck: "Vérifier les mises à jour",
  alreadyChecking: "Vérification déjà en cours",
  statusChecking: "Vérification…",
  checkingNotice: "Recherche de mises à jour…",
  rateLimitedLong:
    "Limite GitHub atteinte. Ajoutez un jeton dans les réglages, ou réessayez plus tard.",
  statusUpToDate: "À jour",
  statusError: "Erreur",
  checkFailed: "Échec de la vérification : {error}",
  checkOnStartup: "Vérifier au démarrage",
  checkOnStartupDesc: "Si désactivé, GitHub n’est contacté que via le bouton ou la commande.",
  ignoreDisabled: "Ignorer les éléments désactivés",
  ignoreDisabledDesc:
    "Avec Lazy Loader, seuls ceux marqués Disabled sont omis. Les chargements différés restent inclus.",
  hideBeta: "Masquer les versions bêta",
  hideBetaDesc:
    "Masque les prereleases GitHub et les versions dont le nom ou les notes indiquent beta, alpha ou rc.",
  daysWait: "Jours d’attente après publication",
  daysWaitDesc: "0 affiche une version dès que cette vérification la trouve.",
  lazyHandling: "Chargement différé",
  lazyHandlingDesc:
    "Évite de traiter comme désactivés les éléments pas encore chargés par Lazy Loader.",
  lazyReadConfig: "Lire les réglages Lazy Loader (recommandé)",
  lazyWaitLoaded: "Attendre la fin du chargement",
  lazyFixedDelay: "Attendre un nombre fixe de secondes",
  lazyNone: "Ne pas attendre",
  waitSeconds: "Secondes d’attente",
  waitTimeout: "Délai max (secondes)",
  githubToken: "Jeton GitHub (facultatif)",
  githubTokenDesc:
    "Sans authentification, environ 60 requêtes par heure. Un PAT reste local et n’est pas envoyé à un serveur K-Tech.",
  supportOptional: "Le soutien est facultatif.",
  selfUpdatedReload: "K-Tech Update Guard a été mis à jour. Rechargement…",
  missingReleaseFiles: "La release n’a pas main.js ou manifest.json",
  installVerifyFailed:
    "Les fichiers de {name} ont été écrits, mais la version installée est encore {version}.",
};

const pt: Messages = {
  thanksInstall: "Obrigado por instalar!",
  updatedTo: "Atualizado para {version}",
  thanksInstallBody:
    "Verifique as atualizações da comunidade e instale só o que selecionar. Se ajudar, considere apoiar o desenvolvimento (opcional).",
  thanksUpdateBody:
    "Obrigado por atualizar. Se ajudar, considere apoiar o desenvolvimento (opcional).",
  bmc: "Buy Me a Coffee",
  later: "Depois",
  noUpdatesTitle: "Não há atualizações agora",
  noUpdatesBody: "Nesta verificação, os itens da comunidade instalados estão atualizados.",
  close: "Fechar",
  updatesTitle: "{count} atualização(ões) disponível(is)",
  updatesBody:
    "Marque o que deseja instalar. Os arquivos vêm de cada GitHub Release (como o atualizador oficial).",
  selectAll: "Selecionar tudo",
  beta: " (beta)",
  updateSelected: "Atualizar selecionados",
  cancel: "Cancelar",
  noneSelected: "Nada selecionado",
  updating: "Atualizando {name}…",
  rateLimitedShort: "Limite do GitHub atingido",
  updatedCount: "{count} item(ns) atualizado(s)",
  statusCheck: "Verificar",
  cmdCheck: "Verificar atualizações",
  alreadyChecking: "Já está verificando",
  statusChecking: "Verificando…",
  checkingNotice: "Procurando atualizações…",
  rateLimitedLong:
    "Limite do GitHub atingido. Adicione um token nas configurações ou tente mais tarde.",
  statusUpToDate: "Atualizado",
  statusError: "Erro",
  checkFailed: "Falha na verificação: {error}",
  checkOnStartup: "Verificar ao iniciar",
  checkOnStartupDesc: "Se estiver desligado, o GitHub só é consultado pelo botão ou comando.",
  ignoreDisabled: "Ignorar desativados",
  ignoreDisabledDesc:
    "Com o Lazy Loader, só os marcados como Disabled são omitidos. Os de carga atrasada entram na lista.",
  hideBeta: "Ocultar versões beta",
  hideBetaDesc:
    "Oculta prereleases do GitHub e versões cujo nome ou notas dizem beta, alpha ou rc.",
  daysWait: "Dias de espera após o lançamento",
  daysWaitDesc: "0 mostra uma versão assim que esta verificação a encontra.",
  lazyHandling: "Carga atrasada",
  lazyHandlingDesc: "Evita tratar como desativados os itens ainda não carregados pelo Lazy Loader.",
  lazyReadConfig: "Ler configurações do Lazy Loader (recomendado)",
  lazyWaitLoaded: "Esperar até carregar",
  lazyFixedDelay: "Esperar um número fixo de segundos",
  lazyNone: "Não esperar",
  waitSeconds: "Segundos de espera",
  waitTimeout: "Tempo máximo (segundos)",
  githubToken: "Token do GitHub (opcional)",
  githubTokenDesc:
    "Sem autenticação, cerca de 60 pedidos por hora. O PAT fica só no dispositivo e não vai para um servidor K-Tech.",
  supportOptional: "O apoio é opcional.",
  selfUpdatedReload: "O K-Tech Update Guard foi atualizado. Recarregando…",
  missingReleaseFiles: "A release não tem main.js ou manifest.json",
  installVerifyFailed:
    "Os arquivos de {name} foram gravados, mas a versão instalada ainda é {version}.",
};

const ru: Messages = {
  thanksInstall: "Спасибо за установку!",
  updatedTo: "Обновлено до {version}",
  thanksInstallBody:
    "Проверяйте обновления сообщества и устанавливайте только выбранное. Поддержка разработки необязательна.",
  thanksUpdateBody:
    "Спасибо за обновление. Поддержка разработки необязательна.",
  bmc: "Buy Me a Coffee",
  later: "Позже",
  noUpdatesTitle: "Сейчас обновлений нет",
  noUpdatesBody: "По этой проверке установленные элементы сообщества актуальны.",
  close: "Закрыть",
  updatesTitle: "Доступно обновлений: {count}",
  updatesBody:
    "Отметьте, что установить. Файлы берутся из GitHub Release (как у официального обновления).",
  selectAll: "Выбрать все",
  beta: " (бета)",
  updateSelected: "Обновить выбранное",
  cancel: "Отмена",
  noneSelected: "Ничего не выбрано",
  updating: "Обновление {name}…",
  rateLimitedShort: "Достигнут лимит GitHub",
  updatedCount: "Обновлено элементов: {count}",
  statusCheck: "Проверка",
  cmdCheck: "Проверить обновления",
  alreadyChecking: "Проверка уже идёт",
  statusChecking: "Проверка…",
  checkingNotice: "Идёт проверка обновлений…",
  rateLimitedLong:
    "Достигнут лимит GitHub. Добавьте токен в настройках или повторите позже.",
  statusUpToDate: "Актуально",
  statusError: "Ошибка",
  checkFailed: "Ошибка проверки: {error}",
  checkOnStartup: "Проверять при запуске",
  checkOnStartupDesc: "Если выключено, GitHub запрашивается только кнопкой или командой.",
  ignoreDisabled: "Пропускать отключённые",
  ignoreDisabledDesc:
    "С Lazy Loader пропускаются только помеченные Disabled. Отложенная загрузка остаётся в списке.",
  hideBeta: "Скрывать бета-версии",
  hideBetaDesc:
    "Скрывает GitHub prerelease и версии, в имени или заметках которых есть beta, alpha или rc.",
  daysWait: "Дней ожидания после выпуска",
  daysWaitDesc: "0 показывает выпуск сразу, как только эта проверка его найдёт.",
  lazyHandling: "Отложенная загрузка",
  lazyHandlingDesc:
    "Не считать отключёнными элементы, которые Lazy Loader ещё не загрузил.",
  lazyReadConfig: "Читать настройки Lazy Loader (рекомендуется)",
  lazyWaitLoaded: "Ждать окончания загрузки",
  lazyFixedDelay: "Ждать фиксированное число секунд",
  lazyNone: "Не ждать",
  waitSeconds: "Секунд ожидания",
  waitTimeout: "Лимит ожидания (секунды)",
  githubToken: "Токен GitHub (необязательно)",
  githubTokenDesc:
    "Без входа около 60 запросов в час. PAT хранится только локально и не отправляется на сервер K-Tech.",
  supportOptional: "Поддержка необязательна.",
  selfUpdatedReload: "K-Tech Update Guard обновлён. Перезагрузка…",
  missingReleaseFiles: "В релизе нет main.js или manifest.json",
  installVerifyFailed:
    "Файлы {name} записаны, но установленная версия всё ещё {version}.",
};

const TABLES: Record<Locale, Messages> = {
  en,
  ja,
  "zh-cn": zhCn,
  "zh-tw": zhTw,
  ko,
  es,
  de,
  fr,
  pt,
  ru,
};

function detectLocale(): Locale {
  let raw = "";
  try {
    raw = String(
      (window.localStorage && window.localStorage.getItem("language")) || ""
    );
  } catch {
    /* ignore */
  }
  if (!raw) {
    try {
      raw = String(navigator.language || "");
    } catch {
      raw = "en";
    }
  }
  const lang = raw.toLowerCase().replace(/_/g, "-");
  if (lang.startsWith("zh")) {
    if (lang.includes("tw") || lang.includes("hk") || lang.includes("hant")) {
      return "zh-tw";
    }
    return "zh-cn";
  }
  if (lang.startsWith("ja")) return "ja";
  if (lang.startsWith("ko")) return "ko";
  if (lang.startsWith("es")) return "es";
  if (lang.startsWith("de")) return "de";
  if (lang.startsWith("fr")) return "fr";
  if (lang.startsWith("pt")) return "pt";
  if (lang.startsWith("ru")) return "ru";
  return "en";
}

function applyVars(template: string, vars?: Vars): string {
  if (!vars) return template;
  let out = template;
  for (const key of Object.keys(vars)) {
    out = out.split("{" + key + "}").join(String(vars[key]));
  }
  return out;
}

export function t(key: keyof Messages, vars?: Vars): string {
  const locale = detectLocale();
  const table = TABLES[locale] || en;
  return applyVars(table[key] || en[key], vars);
}
