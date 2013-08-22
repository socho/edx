import json
f = open("/Users/soyeuncho/Desktop/dummydata.json",'r')
data = json.loads(f.read())

dummymodule = []

for quiz, logsArray in data.iteritems():
    for log in logsArray:
        newlog = log.copy()
        newlog["module_id"] = quiz
        newlog["module_type"] = "problem"
        newlog["student_id"] = newlog["username"]
        newlog.pop("username",None)
        newlog["course_id"] = "6.813"
        newlog["max_grade"] = 10
        dummymodule.append(newlog)

newfile = open("/Users/soyeuncho/Desktop/dummymodule.json",'w')
newfile.write(json.dumps(dummymodule,sort_keys=False, indent=2))
newfile.close()
