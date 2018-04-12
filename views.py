from flask import Flask
from flask import render_template
from flask import jsonify,request
from elasticsearch import Elasticsearch

app=Flask(__name__)
app.jinja_env.variable_start_string = '${ '
app.jinja_env.variable_end_string = ' }}'

with open('app.conf') as file:
    url=file.read()

es = Elasticsearch([url])

@app.route('/')
def index():
	return render_template('index.html')

@app.route('/indexList')
def indexList():
    data=es.indices.get(index='*')
    index=sorted(list(map(lambda x:x,data)))
    return jsonify(index)

@app.route('/tableData',methods=['POST',])
def tableData():
    try:
        resp=request.get_json()
        data=es.get(index=resp['index'].strip(),doc_type=resp['index'].strip(),id=resp['id'].strip())
        dic=dict(data['_source'])
        keyList=[i for i in dic.keys()]
        valueList=list(map(lambda x:"" if x is None else x,[v for v in dic.values()]))
        valueType=list(map(lambda x:"list" if type(x) is list else "integer" if type(x) is int else "string" ,valueList))
        result=[{"key":k,"value":v,"type":t} for k,v,t in zip(keyList,valueList,valueType)]
        return jsonify(result)
    except:
        return "noData"
    
@app.route('/delData',methods=['POST',])
def delData():
    try:
        resp=request.get_json()
        es.delete(index=resp['index'].strip(),doc_type=resp['index'].strip(),id=resp['id'].strip())
        return "ok"
    except:
        return "no"

@app.route('/updateData',methods=['POST',])
def updateData():
    try:
        resp=request.get_json()
        if resp['fieldType']=='list':
            body={"doc":{resp['filed']:resp['editData'].replace('，',',').split(',')}}
        elif resp['fieldType']=='integer':
            body={"doc":{resp['filed']:int(resp['editData'])}}
        else:
            body={"doc":{resp['filed']:str(resp['editData'])}}
        es.update(index=resp['index'].strip(),doc_type=resp['index'].strip(),id=resp['id'].strip(),body=body)
        return "ok"
    except:
        return "noData"

if __name__ == '__main__':
    app.run(host='0.0.0.0',port=5000,use_debugger=False,threaded=True)