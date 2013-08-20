//generateNames takes a integer number of names as an arguement, and returns a list of randomly constructed unique names.
var generateNames = function(numberOfNames){
    var names = []
    var firstNames=["John","Rob", "Ashley", "Hannah", "Caroline", "Bob", "Joey", "James", "Dylan", "Rocky", "Carolyn", "Megan", "Sue", "Sally", "Michelle", "Christopher", "Jamie", "Madison", "Malcolm","Ryan", "Justin"]
    var middleInitial= [ "A","B","C","D","F","G","H","I","J","K","L","M","N","O","P"]
    var lastNames =["Jacobs", "Robertson", "Nguyen", "Jordan", "Kim", "Lee", "Cating", "Anderson", "O'Ryan", "McDonald","Heaton","Wiggins", "Reynolds", "Jackson", "Pierz", "Welsh","Wallace"]
    for (var i=0;i<numberOfNames;i++){
        var randFirst = firstNames[Math.floor(Math.random()*firstNames.length)]
        var randInit = middleInitial[Math.floor(Math.random()*middleInitial.length)]
        var randLast = lastNames[Math.floor(Math.random()*lastNames.length)]
        var name = randFirst+randInit+randLast
        if (names.indexOf(name)==-1){
            names.push(name)
        }
        else{
            i-=1   
        }
    }
    
    return names;
}


var generateNumAttempts = function() {
    var maxAttempts = Math.floor(Math.random()*4+8);
    return Math.floor(1+Math.random()*maxAttempts);
}

var makeFullData = function(numberStudents) {
    var problemIDs = ["Ex 1","Ex 2","Ex 3","Ex 4","Ex 5"];
    var names = generateNames(numberStudents);
    var data = {}
    for (var i=0;i<names.length;i++){
        data[names[i]] = {};
        data[names[i]][problemIDs[0]]= generateNumAttempts();        
        for (var j=1;j<problemIDs.length;j++) {
            if (Math.random()>0.2) {
                data[names[i]][problemIDs[j]]= generateNumAttempts();
            }
        }
    }
    return data;
}

var makeDummyTrackingLogs = function(numberOfLogs){
    var dummyTrackingLogs = [];
    var names = generateNames(Math.round(numberOfLogs/3));
    var event_types = ["show_answer","save_problem_check","save_problem_check","save_problem_check","page_close","play_video"];
    var problem_ids = ["Ex1", "Ex2", "Ex3", "Ex4"]
    var successes = ["correct", "incorrect","incorrect"]
    for (var i = 0; i < numberOfLogs; i++) {
        var thisLog = {};
        thisLog["username"] = names[Math.floor(Math.random() * names.length)];
        thisLog["event_type"] = event_types[Math.floor(Math.random() * event_types.length)];
        thisLog["event"] = {};
        if (thisLog["event_type"] == "save_problem_check") {
            thisLog["event"]["problem_id"] = problem_ids[Math.floor(Math.random() * problem_ids.length)];
            thisLog["event"]["success"] = successes[Math.floor(Math.random() * successes.length)];
        }
        dummyTrackingLogs.push(thisLog);
    }
    return dummyTrackingLogs;
}