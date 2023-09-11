from flask import Flask, request, render_template, redirect, session, jsonify
from flask_sqlalchemy import SQLAlchemy
import bcrypt
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
app.secret_key = 'secret_key'

# Define SQLAlchemy models
class Deposit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(100), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(100), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))

    def __init__(self, email, password, name):
        self.name = name
        self.email = email
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def check_password(self, password):
        return bcrypt.checkpw(password.encode('utf-8'), self.password.encode('utf-8'))

# Create the data tables
with app.app_context():
    db.create_all()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/stability')
def stability():
    return render_template('stability.html')

@app.route('/overview')
def overview():
    return render_template('overview.html')

@app.route('/deposits_and_transactions')
def deposits_and_transactions():
    if 'email' in session:
        user = User.query.filter_by(email=session['email']).first()

        # Fetch deposits and transactions from the database
        deposits = Deposit.query.filter_by(user_id=user.id).all()
        transactions = Transaction.query.filter_by(user_id=user.id).all()

        return render_template('deposits_and_transactions.html', user=user, deposits=deposits, transactions=transactions)

    return redirect('/login')

@app.route('/budgeting')
def budgeting():
    return render_template('budgeting.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # Handle user registration
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']

        new_user = User(name=name, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()
        return redirect('/login')

    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        user = User.query.filter_by(email=email).first()

        if user and user.check_password(password):
            session['email'] = user.email
            return redirect('/overview')
        else:
            return render_template('login.html', error='Invalid user')

    return render_template('login.html')

@app.route('/dashboard')
def dashboard():
    if 'email' in session:
        user = User.query.filter_by(email=session['email']).first()

        # Fetch deposits and transactions from the database
        deposits = Deposit.query.filter_by(user_id=user.id).all()
        transactions = Transaction.query.filter_by(user_id=user.id).all()

        return render_template('dashboard.html', user=user, deposits=deposits, transactions=transactions)

    return redirect('/login')

@app.route('/logout')
def logout():
    session.pop('email', None)
    return redirect('/login')

@app.route('/create_transaction', methods=['POST'])
def create_transaction():
    # Check for an authenticated user
    if 'email' not in session:
        return redirect('/login')
    
    user = User.query.filter_by(email=session['email']).first()
    if not user:
        print("User not found!")
        return redirect('/login')

    # Extract form data
    category = request.form.get('category')
    if category == 'other':
        category = request.form.get('otherCategory')
    amount = float(request.form.get('amount', 0))
    date = request.form.get('date')

    # Handle creating a new transaction based on user input
    try:
        new_transaction = Transaction(user_id=user.id, category=category, amount=amount, date=date)
        db.session.add(new_transaction)
        db.session.commit()
        return redirect('/deposits_and_transactions')
    except Exception as e:
        print(f"Error storing transaction: {e}")
        db.session.rollback()  # Rollback the transaction in case of an error
        return redirect('/deposits_and_transactions')


@app.route('/create_deposit', methods=['POST'])
def create_deposit():
    # Check for an authenticated user
    if 'email' not in session:
        return redirect('/login')
    
    user = User.query.filter_by(email=session['email']).first()
    if not user:
        print("User not found!")
        return redirect('/login')

    # Extract form data
    amount = request.form.get('deposit', None)
    date = request.form.get('date', None)

    # Handle creating a new deposit based on user input
    try:
        new_deposit = Deposit(user_id=user.id, amount=amount, date=date)
        db.session.add(new_deposit)
        db.session.commit()
        return redirect('/deposits_and_transactions')
    except Exception as e:
        print(f"Error storing deposit: {e}")
        db.session.rollback()  # Rollback the transaction in case of an error
        return redirect('/deposits_and_transactions')

if __name__ == '__main__':
    app.run(debug=True)
