from flask import Flask, request, render_template, redirect, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask import jsonify, request
import bcrypt
from datetime import datetime  # Import datetime


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
db = SQLAlchemy(app)
app.secret_key = 'secret_key'

class Deposit(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(100), nullable=False)

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    description = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date = db.Column(db.String(100), nullable=False)

#take out later dude

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True)
    password = db.Column(db.String(100))
    #balance = db.Column(db.String(100))
    

    def __init__(self, email, password, name):
        self.name = name
        self.email = email
        #self.balance = balance
        self.password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def check_password(self,password):
        return bcrypt.checkpw(password.encode('utf-8'),self.password.encode('utf-8'))

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
    '''if request.method == 'POST':
        balance = request.form['balance']
        new_balance = User(balance=balance)
        db.session.commit()'''
    return render_template('deposits_and_transactions.html')

@app.route('/budgeting')
def budgeting():
    return render_template('budgeting.html')



@app.route('/register', methods=['GET','POST'])
def register():
    if request.method == 'POST':
        # handle request
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        

        new_user = User(name=name,email=email,password=password)
        db.session.add(new_user)
        db.session.commit()
        return redirect('/login')

    return render_template('register.html')

@app.route('/login',methods=['GET','POST'])
def login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
    

        user = User.query.filter_by(email=email).first()
        
        if user and user.check_password(password):
            session['email'] = user.email
            return redirect('/overview')
        else:
            return render_template('login.html',error='Invalid user')

    return render_template('login.html')


@app.route('/dashboard')
def dashboard():
    if 'email' in session:
        user = User.query.filter_by(email=session['email']).first()

        # Fetch deposits and transactions from the database (you need to define these models)
        deposits = Deposit.query.filter_by(user_id=user.id).all()
        transactions = Transaction.query.filter_by(user_id=user.id).all()

        return render_template('dashboard.html', user=user, deposits=deposits, transactions=transactions)
    return redirect('/login')


@app.route('/logout')

def logout():
    session.pop('email',None)
    return redirect('/login')

if __name__ == '__main__':
    app.run(debug=True)

@app.route('/deposits_and_transactions')
def deposits_and_transactions():
    return render_template('deposits_and_transactions.html')

@app.route('/store_deposit', methods=['POST'])
def store_deposit():
    # Handle storing the deposit data in the database
    # You need to implement this logic based on your database setup

    # Example code for receiving data from the client:
    data = request.get_json()
    amount = data.get('amount')
    date = data.get('date')

    # Perform database operations to store the deposit

    # Return a response indicating success or failure
    response_data = {'message': 'Deposit stored successfully'}
    return jsonify(response_data), 200

if __name__ == '__main__':
    app.run(debug=True)