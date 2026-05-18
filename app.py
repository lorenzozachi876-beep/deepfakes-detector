from flask import Flask, request, jsonify
from flask_cors import CORS

import tensorflow as tf
import numpy as np
import librosa
import os

app = Flask(__name__)
CORS(app)

model = tf.keras.models.load_model("deepfake_audio_model.keras")


def extract_features(file_path):
    audio, sr = librosa.load(file_path, duration=3)

    mfccs = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=40
    )

    return np.mean(mfccs.T, axis=0)


@app.route('/analisar', methods=['POST'])
def analisar():
    print("🔥 REQUISIÇÃO RECEBIDA")
    print("TESTE OK - CHEGOU AQUI")
    try:
        arquivo = request.files['arquivo']

        caminho = "temp.wav"
        arquivo.save(caminho)

        features = extract_features(caminho)
        features = np.expand_dims(features, axis=0)

        prediction = model.predict(features)[0]
        print("RAW:", prediction)

        # 🔥 CORREÇÃO REAL
        prediction = np.array(prediction, dtype=np.float32)

        exp = np.exp(prediction - np.max(prediction))
        prob = exp / np.sum(exp)

        ia = float(prob[-1]) * 100
        humano = float(prob[0]) * 100

        os.remove(caminho)

        return jsonify({
            "chance_ia": round(ia, 2),
            "chance_humano": round(humano, 2)
        })

    except Exception as erro:
        print("❌ ERRO NO BACKEND:", erro)

        return jsonify({
            "chance_ia": 0,
            "chance_humano": 0,
            "erro": str(erro)
        }), 200


if __name__ == "__main__":
    print("🚀 INICIANDO FLASK...")
    app.run(debug=True, use_reloader=False)