"use strict";
! function () {
    window._DEBUG = -1 < location.search.indexOf("debug"), window._DEBUG && document.documentElement.classList.add("_DEBUG");
    var l = /(ip(ad|hone|od)|android)/i.test(navigator.userAgent) || "macintel" === navigator.platform.toLowerCase() && 1 < navigator.maxTouchPoints,
        m = Math.PI,
        u = 2 * Math.PI,
        e = Math.PI / 2;
    let E = window.innerWidth,
        h = window.innerHeight;
    l && document.documentElement.classList.add("mobile");
    const p = new THREE.Scene,
        w = new THREE.PerspectiveCamera(45, 1, 1, 2e3);
    w.position.set(-64, 126, 102), w.lookAt(p.position), w.fov = 75;
    let f, v, g, y = w,
        x;
    const T = new THREE.WebGLRenderer({
        antialias: !0
    });
    T.setClearColor(14540253), T.setPixelRatio(Math.min(2, window.devicePixelRatio)), T.shadowMap.type = THREE.VSMShadowMap, document.body.appendChild(T.domElement);
    const t = new THREE.EffectComposer(T),
        o = new THREE.RenderPass(p, w);
    t.addPass(o);
    const n = new THREE.OutlinePass(new THREE.Vector2(E, h), p, w);
    n.edgeStrength = 10, n.edgeGlow = .35, n.edgeThickness = 2, n.visibleEdgeColor.set("#ffffff"), n.hiddenEdgeColor.set("#ffffff"), t.addPass(n);
    const R = [];
    let H;
    new THREE.Mesh(new THREE.BoxBufferGeometry(10, 10, 10), new THREE.MeshStandardMaterial({
        color: 65280
    }));
    let a, b, D;
    if (window._DEBUG && (a = new Stats, document.body.appendChild(a.dom), b = new dat.GUI, -1 < location.search.indexOf("control") && (D = new THREE.OrbitControls(w, T.domElement)), p.add(new THREE.AxesHelper(10)), -1 < location.search.indexOf("casting"))) {
        const A = new THREE.Raycaster,
            F = new THREE.Vector2;
        T.domElement.addEventListener("click", function (e) {
            F.x = e.clientX / E * 2 - 1, F.y = 2 * -(e.clientY / h) + 1, A.setFromCamera(F, y);
            e = A.intersectObjects(p.children);
            if (e[0]) {
                const t = e[0].object;
                t.userData.y = t.position.y, t.position.y = 99999
            }
        })
    }
    var i = new THREE.AmbientLight(16777215, .5);
    b && b.add(i, "intensity", 0, 2).name("ambient intensity"), p.add(i),
        function (e, t, o) {
            const n = new THREE.DirectionalLight(16777215, .5);
            if (n.position.set(e, t, o), T.shadowMap.enabled && (n.castShadow = !0, n.shadow.mapSize.width = 1024, n.shadow.mapSize.height = 1024, n.shadow.camera.left = -135, n.shadow.camera.right = 135, n.shadow.camera.top = 135, n.shadow.camera.bottom = -135, n.shadow.camera.far = 200, n.shadow.radius = 40, n.shadow.bias = -.005), p.add(n), b) {
                o = function () {
                    n.target.updateMatrixWorld(), i.update(), n.shadow.camera.updateProjectionMatrix(), e.update()
                };
                const a = b.addFolder("directional light " + Math.random());
                a.add(n, "intensity", 0, 2).name("directional intensity"), a.add(n.position, "x", -500, 500).name("directional x"), a.add(n.position, "y", -500, 500).name("directional y"), a.add(n.position, "z", -500, 500).name("directional z");
                const i = new THREE.DirectionalLightHelper(n);
                p.add(i);
                let e;
                T.shadowMap.enabled && (a.add(n.shadow.camera, "right", 1, 500).name("shadow right").onChange(o), a.add(n.shadow.camera, "top", 1, 500).name("shadow top").onChange(o), a.add(n.shadow.camera, "near", .01, 50).name("shadow near").onChange(o), a.add(n.shadow.camera, "far", .01, 500).name("shadow far").onChange(o), a.add(n.shadow.camera, "zoom", .01, 10).name("shadow zoom").onChange(o), a.add(n.shadow, "bias", -.01, .01, 1e-4).name("shadow bias").onChange(o), a.add(n.shadow, "radius", 0, 5, 1e-4).name("shadow radius").onChange(o), e = new THREE.CameraHelper(n.shadow.camera), p.add(e)), a.open()
            }
            n
        }(60, 90, 55);
    const s = document.querySelector(".enter");
    s.children[1].addEventListener("click", function () {
        j.disabled = !0, x.entering(), s.addEventListener("transitionend", function (e) {
            "opacity" === e.propertyName && s.parentNode.removeChild(s)
        }), s.classList.add("remove")
    });
    const c = document.querySelector(".guide");
    let r = function () {
        s.classList.add("ready"), s.children[0].classList.add("hide"), s.children[1].classList.remove("hide")
    };
    window.addEventListener("resize", d),
        function (u) {
            const e = new THREE.GLTFLoader,
                t = new THREE.DRACOLoader;
            t.setDecoderPath("./resources/draco/"), e.setDRACOLoader(t), e.load("./resources/room-bezier-3.glb", function (e) {
                e.animations[0].tracks.length = 2, console.log(e), H = new THREE.Group, H.add(e.scene), f = H.getObjectByName("Camera_Orientation"), v = f.fov, window.innerWidth < 768 && (f.fov *= 1.2), w.fov = f.fov, D && p.add(new THREE.CameraHelper(f)), H.scale.set(25, 25, 25), H.position.set(-44, -30, 0);
                const o = [],
                    n = [],
                    a = [];
                H.traverse(function (e) {
                    var t;
                    e.isMesh && (-1 < S.indexOf(e.name) ? (e.material = new THREE.MeshStandardMaterial({
                        color: "ivory",
                        roughness: 0
                    }), o.push(e)) : -1 < G.indexOf(e.name) ? (e.material = new THREE.MeshStandardMaterial({
                        color: "gold",
                        roughness: 0
                    }), e.position.set(0, 0, 0), n.push(e)) : -1 < k.indexOf(e.name) ? (e.material = new THREE.MeshStandardMaterial({
                        color: 5592405,
                        roughness: 0
                    }), a.push(e)) : e.material = new THREE.MeshStandardMaterial({
                        color: 16777215,
                        side: THREE.DoubleSide,
                        wireframe: !0
                    }), -1 < (t = z.indexOf(e.name)) ? (e.userData.defaulty = e.position.y, e.position.y = 99999, z[t] = e) : (e.castShadow = !0, e.receiveShadow = !0))
                });
                let t = new THREE.Group;
                if (o.forEach(function (e) {
                        t.add(e)
                    }), t.position.set(-1.381, 0, 3.175), M.position.set(1.381, 0, -3.175), M.add(new THREE.Group), M.children[0].add(t), t = new THREE.Group, n.forEach(function (e) {
                        t.add(e)
                    }), t.position.set(0, 0, 0), L.position.set(2.746, .17, 2.943), L.add(new THREE.Group), L.children[0].add(t), t = new THREE.Group, a.forEach(function (e) {
                        t.add(e)
                    }), t.position.set(.46, 0, -1.604), C.position.set(-.46, 0, 1.604), C.add(new THREE.Group), C.children[0].add(t), P.forEach(function (e) {
                        H.add(e)
                    }), p.add(H), b) {
                    let e = b.addFolder("room");
                    e.add(H.position, "x", -200, 200), e.add(H.position, "y", -200, 200), e.add(H.position, "z", -200, 200), e.open()
                }
                const i = e.animations[0].tracks[1],
                    s = new THREE.Quaternion;
                var r = (new THREE.Quaternion).setFromAxisAngle(new THREE.Vector3(1, 0, 0), f.rotation.x);
                f.rotation.x = 0, f.parent.position.set(0, 0, 0), f.parent.rotation.set(0, 0, 0), i.times.forEach(function (e, t) {
                    t *= 4;
                    s.set(i.values[t], i.values[1 + t], i.values[2 + t], i.values[3 + t]), s.multiply(r), i.values[t] = s.x, i.values[1 + t] = s.y, i.values[2 + t] = s.z, i.values[3 + t] = s.w
                });
                const d = new THREE.AnimationMixer(f),
                    c = d.clipAction(e.animations[0]);
                var l = e.animations[0].duration;
                c.play(), P.forEach(function (e) {
                    d.setTime(l * e.userData.progress), "television" === e.name && (e.rotation.y = -m / 2);
                    let t = (new THREE.Box3).setFromObject(e);
                    t.width = t.max.x - t.min.x, t.height = t.max.y - t.min.y;
                    t.max.z, t.min.z;
                    var o = new THREE.MeshBasicMaterial({
                        color: 65280,
                        side: THREE.FrontSide
                    });
                    let n;
                    "fridge" === e.name ? (n = new THREE.Mesh(new THREE.PlaneBufferGeometry(t.width, t.height - .105), o), n.position.set(t.min.x + t.width / 2, t.min.y + t.height / 2 + .0525, t.max.z - .04)) : "purifier" === e.name ? (n = new THREE.Mesh(new THREE.PlaneBufferGeometry(t.height, t.height), o), n.position.set(2.62, t.min.y + t.height / 2, 2.814), n.rotation.y = -2.392) : "television" === e.name && (n = new THREE.Mesh(new THREE.PlaneBufferGeometry(t.width, t.height), o), n.position.set(-.433, .925, 1.696), n.rotation.y = m / 2, e.rotation.y = 0), n.visible = !1, e.parent.add(n);
                    o = n.rotation.y;
                    n.rotation.y = 0, t = (new THREE.Box3).setFromObject(n), t.width = t.max.x - t.min.x, t.height = t.max.y - t.min.y, t.ratio = t.width / t.height, n.rotation.y = o, e.userData.distancetocamera = f.position.distanceTo(n.position), e.userData.size = t, e.userData.face = n
                }), d.setTime(0), g = {
                    mixer: d,
                    duration: l,
                    progress: 0
                }, u && u()
            })
        }(function () {
                d(),
                    function () {
                        const o = new THREE.Raycaster,
                            n = new THREE.Vector2;
                        l ? T.domElement.addEventListener("click", function (e) {
                            t(e), !s && R[1] && j.movetotarget(R[1])
                        }) : (T.domElement.addEventListener("mousemove", function (e) {
                            t(e)
                        }), T.domElement.addEventListener("click", function (e) {
                            console.log("click", s, R[1]), !s && R[1] && j.movetotarget(R[1])
                        }));
                        let i, s, r;

                        function t(e) {
                            e = c(e);
                            n.x = e[0] / E * 2 - 1, n.y = 2 * -(e[1] / h) + 1, o.setFromCamera(n, y);
                            e = o.intersectObjects(p.children);
                            let t = e[0] ? e[0].object : null;
                            if (t && !t.visible && e[1] && (t = e[1].object), t) {
                                let e = null;
                                for (; t.parent;) {
                                    if (-1 < P.indexOf(t)) {
                                        e = t;
                                        break
                                    }
                                    t = t.parent
                                }
                                R[1] !== e && (R[1] = e, l || (s || T.domElement.classList[e ? "add" : "remove"]("cursor-pointer"), console.log("hover selected change", e)))
                            }
                        }

                        function e(e) {
                            j.disabled || (s = !1, r = null, i = c(e), j.killtween(), document.documentElement.addEventListener("mousemove", a, !1), document.documentElement.addEventListener("touchmove", a, {
                                passive: !1
                            }), document.documentElement.addEventListener("mouseup", d, !1), document.documentElement.addEventListener("touchend", d, !1))
                        }

                        function a(e) {
                            var t = c(e),
                                o = "touchmove" === e.type,
                                n = t[0] - i[0],
                                a = t[1] - i[1];
                            i = t, null === r && (r = o ? Math.abs(n) > Math.abs(a) ? "x" : "y" : "-"), o && "x" !== r || (B.movex += n * (o ? .004 : .0015), Math.abs(B.movex) > m && (B.movex = 0 < B.movex ? B.movex - u : u - B.movex)), o || (B.movey += .001 * a), o && "y" === r ? (j.to -= 5e-4 * a, j.move()) : x.tour(0), s || (T.domElement.classList.add("dragging"), s = !0), e.preventDefault()
                        }

                        function d() {
                            s = !1, T.domElement.classList.remove("dragging"), document.documentElement.removeEventListener("mousemove", a, !1), document.documentElement.removeEventListener("touchmove", a, !1), document.documentElement.removeEventListener("mouseup", d, !1), document.documentElement.removeEventListener("touchend", d, !1)
                        }

                        function c(e) {
                            return e.touches && (e = e.touches[0] || e.changedTouches[0]), [e.pageX || e.clientX, e.pageY || e.clientY]
                        }
                        T.domElement.addEventListener("mousedown", e, !1), T.domElement.addEventListener("touchstart", e, {
                            passive: !1
                        }), document.documentElement.addEventListener("onwheel" in document ? "wheel" : "DOMMouseScroll" in document ? "DOMMouseScroll" : "mousewheel", function (e) {
                            j.disabled || (D || (y = f), e = void 0 !== e.deltaY ? e.deltaY : void 0 !== e.wheelDeltaY ? e.wheelDeltaY : e.detail || -1 * e.wheelDelta, j.to += 3e-5 * e, j.move())
                        }, !1)
                    }(), x = function () {
                        var e = new THREE.Vector3;
                        f.getWorldPosition(e);
                        const t = new THREE.CatmullRomCurve3([w.position.clone(), new THREE.Vector3(w.position.x + 30, w.position.y - 100, w.position.z - 30), new THREE.Vector3(-19, e.y, 47), e]);
                        t.curveType = "chordal";
                        const o = new THREE.Vector3;
                        H.getObjectByName("CameraTarget").getWorldPosition(o);
                        const n = o.clone();
                        o.x += 10, o.y -= 20, o.z = 0;
                        const a = o.clone();
                        w.lookAt(a);
                        const i = {
                            move: 0
                        }; {
                            var s;
                            window._DEBUG && (p.add(new THREE.Line((new THREE.BufferGeometry).setFromPoints(t.getPoints(100)), new THREE.LineBasicMaterial({
                                color: 16711680
                            }))), (s = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1), new THREE.MeshBasicMaterial({
                                color: "brown"
                            }))).position.copy(a), p.add(s), b.add(i, "move", 0, 1, .001).onChange(function () {
                                D || (y = w), r()
                            }), b && b.add(g, "progress", 0, 1, 1e-4).name("animation").listen().onChange(function () {
                                D,
                                d()
                            }))
                        }

                        function r() {
                            var e = t.getPointAt(i.move);
                            a.lerpVectors(o, n, i.move), D || (w.position.copy(e), w.lookAt(a…