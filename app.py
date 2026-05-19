from flask import Flask, request, jsonify, render_template
from flask_cors import CORS

import tensorflow as tf
import numpy as np
import librosa
import os

app = Flask(__name__)
CORS(app)

# carrega modelo
model = tf.keras.models.load_model("deepfake_audio_model.keras")


def extract_features(file_path):
    audio, sr = librosa.load(file_path, duration=3)

    mfccs = librosa.feature.mfcc(
        y=audio,
        sr=sr,
        n_mfcc=40
    )

    return np.mean(mfccs.T, axis=0)


# rota principal
@app.route("/")
def home():
    return render_template("index.html")


# rota da IA
@app.route('/analisar', methods=['POST'])
def analisar():

    try:
        arquivo = request.files['arquivo']

        caminho = "temp.wav"
        arquivo.save(caminho)

        features = extract_features(caminho)
        features = np.expand_dims(features, axis=0)

        prediction = model.predict(features)[0]

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

        print("ERRO:", erro)

        return jsonify({
            "chance_ia": 0,
            "chance_humano": 0,
            "erro": str(erro)
        }), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
