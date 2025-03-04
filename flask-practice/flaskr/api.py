from flask import Blueprint, jsonify, request, session, g
from werkzeug.security import check_password_hash, generate_password_hash
from flaskr.db import get_db
from flaskr.auth import login_required

bp = Blueprint('api', __name__, url_prefix='/api')

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    db = get_db()
    error = None

    if not username:
        error = 'Username is required.'
    elif not password:
        error = 'Password is required.'

    if error is None:
        try:
            db.execute(
                "INSERT INTO user (username, password) VALUES (?, ?)",
                (username, generate_password_hash(password)),
            )
            db.commit()
            return jsonify({'message': 'Registration successful'}), 201
        except db.IntegrityError:
            error = f"User {username} is already registered."

    return jsonify({'error': error}), 400

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    db = get_db()
    error = None
    user = db.execute(
        'SELECT * FROM user WHERE username = ?', (username,)
    ).fetchone()

    if user is None:
        error = 'Incorrect username.'
    elif not check_password_hash(user['password'], password):
        error = 'Incorrect password.'

    if error is None:
        session.clear()
        session['user_id'] = user['id']
        return jsonify({
            'message': 'Login successful',
            'user': {'id': user['id'], 'username': user['username']}
        })

    return jsonify({'error': error}), 401

@bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

@bp.route('/user', methods=['GET'])
def get_current_user():
    if g.user is None:
        return jsonify({'user': None})
    return jsonify({
        'user': {
            'id': g.user['id'],
            'username': g.user['username']
        }
    }) 