const video = document.getElementById('camera');
const fotos = document.getElementById('photos');

// ===============================
// CARREGAR IA
// ===============================

async function carregarIA() {

    console.log("Carregando IA...");

    try {

        const modelPath = '/models';

        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);

        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath);

        console.log("IA pronta!");

        startCamera();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar modelos!");

    }

}

// ===============================
// CAMERA
// ===============================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

        video.srcObject = stream;

    } catch (erro) {

        console.error(erro);

        alert("Erro ao acessar câmera!");

    }

}

// ===============================
// DETECÇÃO FACIAL
// ===============================

video.addEventListener('loadedmetadata', () => {

    setInterval(async () => {

        if (
            video.paused ||
            video.ended ||
            !video.srcObject
        ) return;

        const deteccoes =
            await faceapi
            .detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: 0.5
                })
            )
            .withFaceLandmarks(true);

        window.faceDetections =
            deteccoes;

    }, 60);

});

// ===============================
// CARREGAR PNG
// ===============================

async function carregarImagem(src) {

    return new Promise((resolve) => {

        const img = new Image();

        img.src = src;

        img.onload = () => resolve(img);

    });

}

// ===============================
// FOTO
// ===============================

async function capturarPhoto(efeito) {

    if (!video.videoWidth) {

        alert("Aguarde a câmera!");

        return;

    }

    const photo =
        document.createElement('canvas');

    photo.width = video.videoWidth;

    photo.height = video.videoHeight;

    const context =
        photo.getContext('2d');

    // espelho selfie
    context.translate(photo.width, 0);

    context.scale(-1, 1);

    // ===============================
    // FILTROS
    // ===============================

    switch (efeito) {

        case 'cinza':

            context.filter =
                'grayscale(100%)';

            break;

        case 'inverter':

            context.scale(1, -1);

            context.translate(
                0,
                -photo.height
            );

            break;

        case 'antiga':

            context.filter =
                'sepia(100%)';

            break;

        case 'vintage':

            context.filter =
                'sepia(60%) contrast(110%) brightness(95%) hue-rotate(-15deg)';

            break;

        case 'cyberpunk':

            context.filter =
                'contrast(140%) hue-rotate(130deg) saturate(250%)';

            break;

        case 'brilho':

            context.filter =
                'brightness(220%) contrast(90%)';

            break;

        case 'saturacao':

            context.filter =
                'saturate(350%)';

            break;

        case 'opacity':

            context.filter =
                'opacity(30%)';

            break;

        case 'sombra':

            context.filter =
                'brightness(45%) contrast(170%)';

            break;

        case 'desfoque':

            context.filter =
                'blur(8px)';

            break;

        case 'raio-x':

            context.filter =
                'invert(100%) grayscale(100%) contrast(140%)';

            break;

        case 'noir':

            context.filter =
                'grayscale(100%) contrast(280%) brightness(75%)';

            break;

        default:

            context.filter = 'none';

    }

    // ===============================
    // DESENHA VIDEO
    // ===============================

    context.drawImage(
        video,
        0,
        0,
        photo.width,
        photo.height
    );

    // ===============================
    // FILTROS PNG
    // ===============================

    if (
        window.faceDetections &&
        window.faceDetections.length > 0
    ) {

        const face =
            window.faceDetections[0];

        const pontos =
            face.landmarks.positions;

        // olhos
        const olhoEsq = pontos[36];
        const olhoDir = pontos[45];

        // nariz
        const nariz = pontos[30];

        // boca
        const boca = pontos[57];

        // topo
        const testa = pontos[27];

        // laterais
        const rostoEsq = pontos[0];
        const rostoDir = pontos[16];

        // coordenadas normais
        const olhoEsqX = olhoEsq.x;
        const olhoDirX = olhoDir.x;
        const narizX = nariz.x;
        const bocaX = boca.x;

        // medidas reais
        const distanciaOlhos =
            Math.abs(
                olhoDirX - olhoEsqX
            );

        const larguraMandibula =
            Math.abs(
                pontos[14].x -
                pontos[2].x
            );

        const larguraTesta =
            Math.abs(
                pontos[24].x -
                pontos[19].x
            );

        const larguraRosto =
            (
                larguraMandibula +
                larguraTesta
            ) / 2;

        const centroRosto =
            (
                rostoEsq.x +
                rostoDir.x
            ) / 2;

        const alturaOlhos =
            (
                olhoEsq.y +
                olhoDir.y
            ) / 2;

        const topoCabeca =
            testa.y;

        // angulo cabeça
        const angulo =
            Math.atan2(
                olhoDir.y - olhoEsq.y,
                olhoDirX - olhoEsqX
            );

        // largura boca
        const larguraBoca =
            Math.abs(
                pontos[54].x -
                pontos[48].x
            );

        // ===============================
        // FUNÇÃO DESENHAR
        // ===============================

        async function desenharFiltro(
            caminho,
            x,
            y,
            largura,
            altura
        ) {

            const img =
                await carregarImagem(caminho);

            context.save();

            context.translate(
                centroRosto,
                alturaOlhos
            );

            context.rotate(angulo);

            context.drawImage(
                img,
                x - centroRosto,
                y - alturaOlhos,
                largura,
                altura
            );

            context.restore();

        }

        // ===============================
        // BIGODE
        // ===============================

        if (efeito === 'bigode') {

            await desenharFiltro(
                './assets/bigode.png',
                bocaX - larguraBoca,
                nariz.y + 15,
                larguraBoca * 2,
                120
            );

        }

        // ===============================
        // ÓCULOS
        // ===============================

        if (efeito === 'oculos') {

            await desenharFiltro(
                './assets/oculos.png',
                centroRosto - distanciaOlhos * 1.35,
                alturaOlhos - 55,
                distanciaOlhos * 2.7,
                160
            );

        }

        // ===============================
        // CHAPÉU
        // ===============================

        if (efeito === 'chapeu') {

            await desenharFiltro(
                './assets/chapeu.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 280,
                larguraRosto * 2.2,
                340
            );

        }

        // ===============================
        // COROA
        // ===============================

        if (efeito === 'coroa') {

            await desenharFiltro(
                './assets/coroa.png',
                centroRosto - larguraTesta * 0.9,
                topoCabeca - 220,
                larguraTesta * 1.8,
                190
            );

        }

        // ===============================
        // FONE
        // ===============================

        if (efeito === 'fone') {

            await desenharFiltro(
                './assets/fone.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 120,
                larguraRosto * 2.2,
                340
            );

        }

        // ===============================
        // MÁSCARA
        // ===============================

        if (efeito === 'mascara') {

            await desenharFiltro(
                './assets/mascara.png',
                centroRosto - larguraRosto * 0.85,
                alturaOlhos - 80,
                larguraRosto * 1.7,
                340
            );

        }

        // ===============================
        // BATMAN
        // ===============================

        if (efeito === 'batman') {

            await desenharFiltro(
                './assets/batman.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 200,
                larguraRosto * 2.2,
                430
            );

        }

        // ===============================
        // CACHORRO
        // ===============================

        if (efeito === 'cachorro') {

            await desenharFiltro(
                './assets/cachorro.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 140,
                larguraRosto * 2.2,
                390
            );

        }

        // ===============================
        // PALHAÇO
        // ===============================

        if (efeito === 'palhaco') {

            await desenharFiltro(
                './assets/palhaco.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 150,
                larguraRosto * 2.2,
                420
            );

        }

        // ===============================
        // GATO
        // ===============================

        if (efeito === 'gato') {

            await desenharFiltro(
                './assets/gato.png',
                centroRosto - larguraRosto * 1.1,
                topoCabeca - 150,
                larguraRosto * 2.2,
                360
            );

        }

    }

    // ===============================
    // GALERIA
    // ===============================

    const galeriaTitulo =
        fotos.querySelector('h1');

    galeriaTitulo.insertAdjacentElement(
        'afterend',
        photo
    );

}

// ===============================
// INICIAR
// ===============================

window.addEventListener(
    'DOMContentLoaded',
    () => {

        carregarIA();

    }
);