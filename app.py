from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Permet à la page HTML d'appeler l'API

@app.route('/carre', methods=['POST'])
def calculer_carre():
    data = request.get_json()
    nombre = data.get('nombre')

    if nombre is None:
        return jsonify({'erreur': 'Aucun nombre fourni'}), 400

    try:
        nombre = float(nombre)
        resultat = nombre ** 2
        return jsonify({'resultat': resultat})
    except ValueError:
        return jsonify({'erreur': 'Valeur invalide'}), 400

if __name__ == '__main__':
    app.run(debug=True, port=5000)