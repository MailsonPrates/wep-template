/**
 * Testes de ponta a ponta no sandbox (chamado por tests/e2e/sandbox.js com o servidor no ar e o banco
 * recém-instalado). Páginas renderizadas pelo jsdom com o build de produção; chamadas de API por fetch.
 *
 * Para acrescentar um teste: um bloco `await section("nome", async () => { ... check(...) })`.
 */
const fs = require("fs");
const path = require("path");
const { JSDOM, VirtualConsole, CookieJar } = require("jsdom");

module.exports = async function run({ base: BASE, sandbox: SANDBOX, admin: ADMIN, fixtures: FIXTURES }) {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    let failures = 0;
    let total = 0;

    const check = (name, ok, extra = "") => {
        total++;
        if (ok) return;
        failures++;
        console.log(`  FALHA ${name}${extra ? " — " + String(extra).slice(0, 300) : ""}`);
    };

    const section = async (name, fn) => {
        const before = failures;
        try {
            await fn();
        } catch (error) {
            failures++;
            console.log(`  ERRO  ${error.stack || error.message}`.slice(0, 600));
        }
        console.log(`${failures === before ? "ok   " : "FALHA"} ${name}`);
    };

    // --- HTTP com cookies ----------------------------------------------------------
    async function http(jar, method, url, body, { form = false } = {}) {
        const full = new URL(url, BASE).href;
        const headers = { Origin: BASE, Accept: "application/json" };
        const cookie = jar.getCookieStringSync(full);
        if (cookie) headers.Cookie = cookie;
        let payload;
        if (form) payload = body;
        else if (body !== undefined) { headers["Content-Type"] = "application/json"; payload = JSON.stringify(body); }
        const res = await fetch(full, { method, headers, body: payload, redirect: "manual" });
        for (const c of res.headers.getSetCookie()) jar.setCookieSync(c, full);
        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { /* html */ }
        return { status: res.status, json, text };
    }

    const api = (jar, url, body, opts) => http(jar, "POST", url, body, opts);

    async function login(username = ADMIN.username, password = ADMIN.password) {
        const jar = new CookieJar();
        const res = await api(jar, "/login/api/login/", { username, password });
        jar.lastLogin = res.json;
        return jar;
    }

    // --- jsdom -----------------------------------------------------------------------
    async function open(pagePath, jar) {
        const errors = [];
        const navigations = [];
        const apiCalls = [];
        const vc = new VirtualConsole();
        vc.on("jsdomError", (e) => {
            const msg = String(e.detail?.message || e.message);
            if (msg.includes("Could not parse CSS")) return;
            if (msg.includes("navigation")) navigations.push(msg); else errors.push(msg.slice(0, 300));
        });
        vc.on("error", (...a) => errors.push(a.map(String).join(" ").slice(0, 300)));

        // fromURL recusa respostas que não são 2xx (página sem permissão responde 403)
        const cookie = jar.getCookieStringSync(BASE + pagePath);
        const page = await fetch(BASE + pagePath, { headers: cookie ? { Cookie: cookie } : {}, redirect: "manual" });
        const html = await page.text();

        const dom = new JSDOM(html, {
            url: BASE + pagePath, cookieJar: jar, runScripts: "dangerously", resources: "usable", pretendToBeVisual: true, virtualConsole: vc,
            beforeParse(window) {
                window.fetch = async (url, opts = {}) => {
                    const full = new URL(url, window.location.href).href;
                    if (full.includes("/api/")) apiCalls.push(new URL(full).pathname);
                    const headers = { ...(opts.headers || {}), Origin: BASE, Referer: window.location.href };
                    const c = jar.getCookieStringSync(full);
                    if (c) headers.Cookie = c;
                    const res = await fetch(full, { ...opts, headers, redirect: "manual" });
                    for (const set of res.headers.getSetCookie?.() || []) jar.setCookieSync(set, full);
                    return res;
                };
                window.matchMedia = () => ({ matches: false, addListener() {}, removeListener() {}, addEventListener() {}, removeEventListener() {} });
                window.scrollTo = () => {};
                window.confirm = () => true;
            },
        });

        await new Promise((r) => dom.window.addEventListener("load", r));
        await sleep(1200);

        const doc = dom.window.document;
        const navigate = async (to) => {
            dom.window.history.pushState({}, "", to);
            dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate", { state: {} }));
            await sleep(1200);
        };

        return { dom, doc, status: page.status, errors, navigations, apiCalls, navigate, text: () => doc.getElementById("app")?.textContent || "" };
    }

    const catalog = JSON.parse(fs.readFileSync(path.join(SANDBOX, "public/assets/icons/hi2-outline.json"), "utf8"));
    const byRole = JSON.parse(fs.readFileSync(path.join(SANDBOX, "storage/builds/route-maps.build.json"), "utf8"));
    const pages = [...new Set(Object.values(byRole).map((r) => r.path))].filter((p) => !p.includes("{") && !p.startsWith("/login"));
    const admin = await login();

    // ---------------------------------------------------------------------------------
    await section("páginas públicas e roteamento", async () => {
        let p = await open("/login/", new CookieJar());
        check("login renderiza", /Acesse sua conta/.test(p.text()) && !p.errors.length, p.errors.join(" | "));
        check("main.css e theme.css carregados", !!p.doc.querySelector('link[href*="css/main.css?v="]') && !!p.doc.querySelector("#app-theme"));
        p = await open("/login/recovery/", new CookieJar());
        check("recuperação renderiza", /Recuperar senha/.test(p.text()) && !p.errors.length, p.errors.join(" | "));
        const override = await http(new CookieJar(), "GET", "/login/?route=/admin/user/");
        check("?route= não troca a rota", override.status === 200 && /window\.App/.test(override.text), override.status);
    });

    await section(`admin abre as ${pages.length} páginas sem erros`, async () => {
        check("login leva à rota inicial (Home)", admin.lastLogin && admin.lastLogin.redirect === "/", JSON.stringify(admin.lastLogin));
        for (const pagePath of pages) {
            const p = await open(pagePath, admin);
            check(`página ${pagePath}`, p.status === 200 && !p.errors.length && p.text().trim() && !/Acesso negado/.test(p.text()), p.errors.join(" | ") || p.status);
        }
        const edit = await open("/admin/user/1/edit/", admin);
        check("página com parâmetro", /Editar usuário/.test(edit.text()) && !edit.errors.length, edit.errors.join(" | "));
    });

    await section("menu lateral: ícones do servidor, item ativo e grupo aberto", async () => {
        const p = await open("/admin/user/", admin);
        const items = [...p.doc.querySelectorAll(".sidebar .menu > li.item-main")];
        check("3 itens principais com SVG", items.length === 3 && items.every((li) => li.querySelector("svg.menu-icon path")), items.length);
        const active = p.doc.querySelector(".sidebar a.menu-item-link.active");
        check("item da página atual ativo", active && active.getAttribute("href") === "/admin/user/");
        check("grupo da página aberto", !!p.doc.querySelector('.sidebar button[aria-expanded="true"]'));
    });

    await section("menu: troca de ícone pelo painel (sem rebuild)", async () => {
        const menus = (await api(admin, "/config/menu/api/get/", {})).json.data;
        const home = menus[0].child.find((item) => item.title === "Home");
        const bad = await api(admin, "/config/menu/api/item/update/", { id: home.id, icon: "HiFakeIcon" });
        check("ícone inexistente recusado", bad.json && bad.json.error);
        const legacy = await api(admin, "/config/menu/api/item/update/", { id: home.id, icon: '{"import":"alert(1)","from":"x"}' });
        check("formato antigo (injeção) recusado", legacy.json && legacy.json.error);
        await api(admin, "/config/menu/api/item/update/", { id: home.id, icon: "HiOutlineStar" });
        const p = await open("/", admin);
        const d = p.doc.querySelector(".sidebar .menu > li.item-main svg path")?.getAttribute("d");
        check("sidebar mostra o ícone novo", d === catalog.HiOutlineStar.child[0].attr.d);
    });

    await section("grupo: rota inicial e permissões valendo na hora", async () => {
        const group = (await api(admin, "/admin/user/group/api/get/", { id: 1 })).json.data;
        const invalid = await api(admin, "/admin/user/group/api/update/", { id: 1, home_role: "page.nao.existe" });
        check("rota inicial inválida recusada", invalid.json && invalid.json.error);
        await api(admin, "/admin/user/group/api/update/", { id: 1, home_role: "page.admin.user" });
        const other = await login();
        check("login cai na rota inicial do grupo", other.lastLogin && other.lastLogin.redirect === "/admin/user/", JSON.stringify(other.lastLogin));
        await api(admin, "/admin/user/group/api/update/", { id: 1, home_role: "page.home" });

        const without = group.roles.split(",").filter((role) => role !== "api.admin.user.get").join(",");
        await api(admin, "/admin/user/group/api/update/", { id: 1, roles: without });
        check("permissão revogada → 403 na mesma sessão", (await api(other, "/admin/user/api/get/", {})).status === 403);
        await api(admin, "/admin/user/group/api/update/", { id: 1, roles: group.roles });
        check("permissão devolvida → 200", (await api(other, "/admin/user/api/get/", {})).status === 200);
    });

    await section("permissão de página (usuário restrito)", async () => {
        await api(admin, "/admin/user/group/api/create/", { name: "Suporte", roles: "page.admin.user,api.admin.user.get", home_role: "page.admin.user" });
        const groups = (await api(admin, "/admin/user/group/api/get/", {})).json.data;
        const groupId = groups.find((g) => g.name === "Suporte").user_group_id;
        await api(admin, "/admin/user/api/save/", { firstname: "Sup", lastname: "Teste", username: "suporte", no_email: true, user_group_id: groupId });
        const users = (await api(admin, "/admin/user/api/get/", {})).json.data;
        const userId = users.find((u) => u.username === "suporte").user_id;
        await api(admin, "/admin/user/api/save/", { user_id: userId, firstname: "Sup", lastname: "Teste", username: "suporte", email: "", no_email: true, status: "ativado", user_group_id: groupId, password: "OutraSenha123" });

        const sup = await login("suporte", "OutraSenha123");
        check("login do restrito cai na rota inicial dele", sup.lastLogin && sup.lastLogin.redirect === "/admin/user/", JSON.stringify(sup.lastLogin));

        let p = await open("/admin/user/group/", sup);
        check("URL sem permissão → 403 + Acesso negado", p.status === 403 && /Acesso negado/.test(p.text()), `${p.status} ${p.text().slice(0, 60)}`);
        check("…dentro do layout e sem chamar a API da página", !!p.doc.querySelector(".main-nav") && !p.apiCalls.some((c) => c.startsWith("/admin/user/group/api")), p.apiCalls.join(","));

        p = await open("/admin/user/", sup);
        check("página permitida abre", p.status === 200 && /suporte/i.test(p.text()));
        check("'Meus dados' escondido", ![...p.doc.querySelectorAll(".dropdown-item")].some((a) => a.textContent.includes("Meus dados")));
        const before = p.apiCalls.length;
        await p.navigate("/config/menu/");
        check("navegação no app → Acesso negado sem chamar API", /Acesso negado/.test(p.text()) && p.apiCalls.length === before, p.apiCalls.slice(before).join(","));
        await p.navigate("/");
        check("Home liberada", !/Acesso negado/.test(p.text()) && /Olá/.test(p.text()));
        check("sem erros JS", !p.errors.length, p.errors.join(" | "));
    });

    await section("Visual: cores, fonte, título, logos e favicon", async () => {
        const image = (name = "logo.png") => {
            const fd = new FormData();
            const blob = new Blob([fs.readFileSync(path.join(FIXTURES, name))], { type: "image/png" });
            fd.append("file", blob, name);
            return fd;
        };
        const upload = (variant) => {
            const fd = image();
            fd.append("variant", variant);
            return api(admin, "/config/visual/api/logo/", fd, { form: true });
        };

        const bad = await api(admin, "/config/visual/api/colors/", {
            colors: { primary_bg: "red;}body{display:none" },
        });
        check("cor inválida recusada", bad.json && bad.json.error);

        const badFont = await api(admin, "/config/visual/api/colors/", {
            colors: {},
            text: { font: "Inter;}body{display:none" },
        });
        check("fonte inválida recusada", badFont.json && badFont.json.error);

        const badSize = await api(admin, "/config/visual/api/colors/", { colors: {}, text: { title_size: 500 } });
        check("tamanho de título fora da faixa recusado", badSize.json && badSize.json.error);

        await api(admin, "/config/visual/api/colors/", {
            colors: { primary_bg: "#123456", nav_bg: "#222222", title_text: "#aa0000" },
            text: { font: "inter", title_size: 30 },
        });
        const css = fs.readFileSync(path.join(SANDBOX, "public/assets/css/theme.css"), "utf8");
        check("theme.css regerado", css.includes("--bs-btn-bg: #123456") && css.includes("--app-nav-bg: #222222"));
        check("links e foco seguem a cor primária", css.includes("--bs-link-color: #123456"));
        check("fonte no tema (grafia da lista)", css.includes('--bs-body-font-family: "Inter"'));
        check("cor e tamanho do título", css.includes(".page-header h1 { color: #aa0000; font-size: 30px; }"));

        let p = await open("/login/", new CookieJar());
        const fontLink = p.doc.querySelector('link[href^="https://fonts.googleapis.com/"]');
        check(
            "página carrega a fonte com os pesos",
            fontLink && fontLink.getAttribute("href").includes("family=Inter:wght@300;400;500;600;700;900"),
            fontLink && fontLink.getAttribute("href")
        );

        const sent = await upload("logo");
        const logo = sent.json && sent.json.data && sent.json.data.images.logo.url;
        check(
            "upload → .webp do ImageCache",
            logo && /\/cache\/logo\/logo-[a-f0-9]+-0x240\.webp\?v=\d+$/.test(logo),
            JSON.stringify(sent.json).slice(0, 150)
        );
        p = await open("/login/", new CookieJar());
        check("login mostra o logo novo", p.doc.querySelector("img.brand-logo")?.getAttribute("src") === logo);

        const dark = await upload("logo_dark");
        const darkUrl = dark.json && dark.json.data && dark.json.data.images.logo_dark.url;
        check("logo para fundo escuro", darkUrl && /logo-dark-[a-f0-9]+-0x240\.webp/.test(darkUrl), darkUrl);
        p = await open("/", admin);
        const navLogo = p.doc.querySelector(".main-nav img.brand-logo");
        check("nav escura usa o logo para fundo escuro", navLogo && navLogo.getAttribute("src") === darkUrl);

        const favicon = await upload("favicon");
        check("upload do favicon", favicon.json && favicon.json.data && favicon.json.data.images.favicon.custom);
        p = await open("/login/", new CookieJar());
        const icon = p.doc.querySelector('link[rel="icon"][sizes="32x32"]');
        const apple = p.doc.querySelector('link[rel="apple-touch-icon"]');
        check(
            "favicon 32x32 e 180x180 em PNG",
            icon && /favicon-[a-f0-9]+-32x32c\.png/.test(icon.getAttribute("href")) && apple,
            icon && icon.getAttribute("href")
        );

        const notImage = new FormData();
        notImage.append("file", new Blob(["<?php echo 1;"], { type: "image/png" }), "x.png");
        check("arquivo que não é imagem recusado", (await api(admin, "/config/visual/api/logo/", notImage, { form: true })).json.error);

        const badVariant = await upload("../x");
        check("variação desconhecida recusada", badVariant.json && badVariant.json.error);

        for (const variant of ["logo_dark", "favicon"]) {
            await api(admin, "/config/visual/api/logo/remove/", { variant });
        }
        const restore = await api(admin, "/config/visual/api/logo/remove/", {});
        check("restaurar → logo padrão", restore.json && restore.json.data.logo === "/assets/images/logo.png");
        p = await open("/login/", new CookieJar());
        check("favicon padrão de volta", !!p.doc.querySelector('link[rel="icon"][href*="images/favicon.png"]'));

        // volta ao tema padrão para não afetar as outras seções
        await api(admin, "/config/visual/api/colors/", {
            colors: { primary_bg: "#ff7a59", nav_bg: "#f8f9fa", title_text: "#212529" },
            text: { font: "Jost", title_size: 0 },
        });
    });

    await section("foto do perfil em .webp", async () => {
        const jar = await login();
        const fd = new FormData();
        const photo = new Blob([fs.readFileSync(path.join(FIXTURES, "logo.png"))], { type: "image/png" });
        fd.append("file", photo, "foto.png");
        fd.append("firstname", "Maria");
        fd.append("lastname", "Admin");
        fd.append("nickname", "");
        fd.append("password", "");
        fd.append("image_update", "true");
        fd.append("image_remove", "false");
        const saved = await api(jar, "/user/profile/api/salvar/", fd, { form: true });
        check("perfil salvo com foto", saved.json && !saved.json.error, saved.json && saved.json.message);

        const p = await open("/", jar);
        const avatar = p.doc.querySelector(".main-nav .nav-avatar");
        const style = avatar ? avatar.getAttribute("style") || "" : "";
        check("foto da nav em .webp (original intacto)", /-36x36c\.webp/.test(style), style.slice(0, 120));
    });

    await section("usuários e sessão", async () => {
        const created = await api(admin, "/admin/user/api/save/", { firstname: "Ana", lastname: "Teste", username: "ana.teste", email: "ana@exemplo.test", user_group_id: 1 });
        check("criar usuário com e-mail", created.json && !created.json.error, created.json && created.json.message);

        // sem CRUD automático: só existem as rotas declaradas no config/module.php
        // (rota desconhecida cai na página do front, que mostra o 404: nenhum controller roda)
        const removed = await api(admin, "/admin/user/api/create/", { firstname: "X" });
        check("rota CRUD não declarada não executa", removed.json === null, removed.status);

        const jar = await login();
        const p = await open("/admin/user/", jar);
        jar.removeAllCookiesSync();
        await p.navigate("/admin/user/group/");
        check("sessão expirada na tela → vai para o login", p.navigations.length > 0);
    });

    console.log(failures ? `\n${failures} falha(s) em ${total} verificações` : `\ntudo ok (${total} verificações)`);

    return failures;
};
