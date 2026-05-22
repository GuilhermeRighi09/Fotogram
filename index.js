const video = document.getElementById('camera');
const fotos = document.getElementById('photos');

// =========================
// CARREGAR IA
// =========================

async function carregarIA() {

    console.log("Carregando IA...");

    try {

        const modelPath = '/models';

        await faceapi.nets.tinyFaceDetector.loadFromUri(modelPath);

        await faceapi.nets.faceLandmark68TinyNet.loadFromUri(modelPath);

        await faceapi.nets.faceExpressionNet.loadFromUri(modelPath);

        console.log("IA pronta!");

        startCamera();

    } catch (erro) {

        console.error(erro);

        alert("Erro ao carregar modelos!");

    }

}

// =========================
// CAMERA
// =========================

async function startCamera() {

    try {

        const stream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

        video.srcObject = stream;

    } catch (erro) {

        console.error(erro);

        alert("Erro ao acessar câmera!");

    }

}

// =========================
// DETECÇÃO FACIAL
// =========================

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
                new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks(true)
            .withFaceExpressions();

        // salva detecções
        window.faceDetections =
            deteccoes;

    }, 100);

});

// =========================
// CARREGAR IMAGEM
// =========================

async function carregarImagem(src) {

    return new Promise((resolve) => {

        const img = new Image();

        img.src = src;

        img.onload = () => resolve(img);

    });

}

// =========================
// FOTO
// =========================

async function capturarPhoto(efeito) {

    if (!video.videoWidth) {

        alert("Aguarde câmera carregar!");

        return;

    }

    const photo =
        document.createElement('canvas');

    photo.width = video.videoWidth;

    photo.height = video.videoHeight;

    const context =
        photo.getContext('2d');

    // espelho
    context.translate(photo.width, 0);

    context.scale(-1, 1);

    // =========================
    // FILTROS
    // =========================

    switch (efeito) {

        case 'inverter':

    context.scale(1, -1);

    context.translate(0, -photo.height);

    break;

    case 'cinza':

        context.filter =
            'grayscale(100%)';

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

    // desenha câmera
    context.drawImage(
        video,
        0,
        0,
        photo.width,
        photo.height
    );

    // =========================
    // EFEITOS PNG
    // =========================

    if (
        window.faceDetections &&
        window.faceDetections.length > 0
    ) {

        const face =
            window.faceDetections[0];

        const pontos =
            face.landmarks.positions;

        // inverter X
        const inverterX =
            (x) => photo.width - x;

        // pontos
        const olhoEsq = pontos[36];
        const olhoDir = pontos[45];

        const nariz = pontos[30];

        const boca = pontos[57];

        const testa = pontos[27];

        const rostoEsq = pontos[0];
        const rostoDir = pontos[16];

        // coordenadas invertidas
        const olhoEsqX =
            inverterX(olhoEsq.x);

        const olhoDirX =
            inverterX(olhoDir.x);

        const narizX =
            inverterX(nariz.x);

        const bocaX =
            inverterX(boca.x);

        // tamanhos
        const larguraOlhos =
            Math.abs(
                olhoDirX - olhoEsqX
            );

        const larguraRosto =
            Math.abs(
                inverterX(rostoDir.x) -
                inverterX(rostoEsq.x)
            );

        const centroRosto =
            (
                inverterX(rostoEsq.x) +
                inverterX(rostoDir.x)
            ) / 2;

        const topoCabeca =
            testa.y;

        // =========================
        // BIGODE
        // =========================

        if (efeito === 'bigode') {

            const img =
                await carregarImagem(
                    './assets/bigode.png'
                );

            context.drawImage(
                img,
                bocaX - 130,
                nariz.y + 20,
                260,
                160
            );

        }

        // =========================
        // ÓCULOS
        // =========================

        if (efeito === 'oculos') {

            const img =
                await carregarImagem(
                    './assets/oculos.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraOlhos * 1.2,
                olhoEsq.y - 40,
                larguraOlhos * 2.4,
                140
            );

        }

        // =========================
        // CHAPÉU
        // =========================

        if (efeito === 'chapeu') {

            const img =
                await carregarImagem(
                    './assets/chapeu.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto,
                topoCabeca - 260,
                larguraRosto * 2,
                320
            );

        }

        // =========================
        // COROA
        // =========================

        if (efeito === 'coroa') {

            const img =
                await carregarImagem(
                    './assets/coroa.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto * 0.7,
                topoCabeca - 210,
                larguraRosto * 1.4,
                200
            );

        }

        // =========================
        // FONE
        // =========================

        if (efeito === 'fone') {

            const img =
                await carregarImagem(
                    './assets/fone.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto,
                topoCabeca - 80,
                larguraRosto * 2,
                320
            );

        }

        // =========================
        // MÁSCARA
        // =========================

        if (efeito === 'mascara') {

            const img =
                await carregarImagem(
                    './assets/mascara.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto * 0.75,
                olhoEsq.y - 70,
                larguraRosto * 1.5,
                320
            );

        }

        // =========================
        // BATMAN
        // =========================

        if (efeito === 'batman') {

            const img =
                await carregarImagem(
                    './assets/batman.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto,
                topoCabeca - 180,
                larguraRosto * 2,
                420
            );

        }


        if (efeito === 'cachorro') {

            const img =
                await carregarImagem(
                    './assets/cachorro.png'
                );

            context.drawImage(
                img,
                centroRosto - larguraRosto,
                topoCabeca - 120,
                larguraRosto * 2,
                360
            );

        }

        if (efeito === 'palhaco') {

    const img =
        await carregarImagem(
            './assets/palhaco.png'
        );

    context.drawImage(
        img,
        centroRosto - larguraRosto,
        topoCabeca - 120,
        larguraRosto * 2,
        380
    );

}
    if (efeito === 'gato') {

    const img =
        await carregarImagem(
            './assets/gato.png'
        );

    context.drawImage(
        img,
        centroRosto - larguraRosto,
        topoCabeca - 140,
        larguraRosto * 2,
        340
    );

}

    }

    const galeriaTitulo =
        fotos.querySelector('h1');

    galeriaTitulo.insertAdjacentElement(
        'afterend',
        photo
    );

}

window.addEventListener(
    'DOMContentLoaded',
    () => {

        carregarIA();

    }
);