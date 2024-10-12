from flask import Flask, render_template, request, jsonify, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, UserMixin, current_user
from datetime import datetime
from functools import wraps  # 데코레이터를 사용하기 위해 추가

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # 실제 비밀 키로 교체하세요.
bcrypt = Bcrypt(app)

# 로그인 매니저 설정
login_manager = LoginManager(app)
login_manager.login_view = 'login'

# 데이터베이스 설정
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///pins.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# 데이터베이스 모델 정의
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

class Pin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    store_name = db.Column(db.String(100), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    rating = db.Column(db.Float, nullable=False)
    comment = db.Column(db.String(200), nullable=True)
    comments = db.relationship('Comment', backref='pin', lazy=True)

class Comment(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pin_id = db.Column(db.Integer, db.ForeignKey('pin.id'), nullable=False)
    author = db.Column(db.String(100), nullable=False)
    content = db.Column(db.String(200), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# 로그인 매니저 사용자 로더 함수
@login_manager.user_loader
def load_user(user_id):
    return db.session.get(User, int(user_id))  # SQLAlchemy 2.0 방식으로 수정

# 관리자 권한 확인 데코레이터 추가
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or not current_user.is_admin:
            return jsonify({'error': '접근 권한이 없습니다.'}), 403
        return f(*args, **kwargs)
    return decorated_function

# 데이터베이스 초기화 및 관리자 계정 생성
with app.app_context():
    db.create_all()
    # 관리자 계정 생성 (이미 존재하는 경우 생성하지 않음)
    if not User.query.filter_by(username='admin').first():
        hashed_password = bcrypt.generate_password_hash('admin_password').decode('utf-8')
        admin_user = User(username='admin', password=hashed_password, is_admin=True)
        db.session.add(admin_user)
        db.session.commit()

# 라우트 정의
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password_candidate = request.form['password']
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password, password_candidate):
            login_user(user)
            return redirect(url_for('index'))
        else:
            error = '로그인 정보가 올바르지 않습니다.'
            return render_template('login.html', error=error)
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('index'))

@app.route('/pins', methods=['GET', 'POST'])
def pins():
    if request.method == 'GET':
        pins = Pin.query.all()
        pins_data = [{
            'id': pin.id,
            'store_name': pin.store_name,
            'latitude': pin.latitude,
            'longitude': pin.longitude,
            'rating': pin.rating,
            'comment': pin.comment,
            'comment_count': len(pin.comments)
        } for pin in pins]
        return jsonify(pins_data)
    elif request.method == 'POST':
        if not current_user.is_authenticated:
            return jsonify({'error': '로그인이 필요합니다.'}), 401
        data = request.get_json()
        new_pin = Pin(
            store_name=data['store_name'],
            latitude=data['latitude'],
            longitude=data['longitude'],
            rating=data['rating'],
            comment=data['comment']
        )
        db.session.add(new_pin)
        db.session.commit()
        return jsonify({'status': 'success'}), 201

@app.route('/pin_list', methods=['GET'])
def pin_list():
    pins = Pin.query.order_by(Pin.rating.desc()).all()
    pins_data = [{
        'id': pin.id,
        'store_name': pin.store_name,
        'latitude': pin.latitude,
        'longitude': pin.longitude,
        'rating': pin.rating,
        'comment': pin.comment,
        'comment_count': len(pin.comments)
    } for pin in pins]
    return jsonify(pins_data)

@app.route('/pins/<int:pin_id>/comments', methods=['GET', 'POST'])
def comments(pin_id):
    if request.method == 'GET':
        comments = Comment.query.filter_by(pin_id=pin_id).order_by(Comment.created_at.desc()).all()
        comments_data = [{
            'id': c.id,
            'author': c.author,
            'content': c.content,
            'created_at': c.created_at.strftime('%Y-%m-%d %H:%M:%S')
        } for c in comments]
        return jsonify(comments_data)
    elif request.method == 'POST':
        # 누구나 코멘트를 추가할 수 있도록 로그인 여부를 확인하지 않음
        data = request.get_json()
        author = data.get('author')
        content = data.get('content')
        if not author or not content:
            return jsonify({'error': '작성자와 코멘트 내용이 필요합니다.'}), 400
        new_comment = Comment(pin_id=pin_id, author=author, content=content)
        db.session.add(new_comment)
        db.session.commit()
        return jsonify({'status': 'success'}), 201

@app.route('/comments/<int:comment_id>', methods=['DELETE'])
@admin_required  # 관리자 권한이 필요함
def delete_comment(comment_id):
    comment = Comment.query.get(comment_id)
    if not comment:
        return jsonify({'error': '코멘트를 찾을 수 없습니다.'}), 404
    db.session.delete(comment)
    db.session.commit()
    return jsonify({'status': 'success'}), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
    # app.run(debug=True, host='0.0.0.0', port=8000)
