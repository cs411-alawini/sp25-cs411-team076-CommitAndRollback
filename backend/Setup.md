## Installations 
1. Create a new Python Environment and source into it 
```
python3 -m venv <myenvpath>
source <myenvpath>/bin/activate 
```

2. Install the following things in the environment 
```
pip3 install flask==3.0.2
pip3 install flask-cors==4.0.0
pip3 install cloud-sql-python-connector
pip3 install pymysql==1.1.0
pip3 install sqlalchemy==2.0.39
pip3 install google-auth==2.28.1
```

3. Run the backend 
```
python3 main.py
```