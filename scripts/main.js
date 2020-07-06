require("unitSpawner");
require("dpsTurret")
require("iNode");
require("dpsBlock");
require("throughputVoid");
require("mechTester")

if(!this.global.done){
    this.global.done = true;
    Events.on(EventType.PlayerChatEvent, cons(e=>{
        if(e.message=="t!delta"){
            Call.sendChatMessage("Toggled throughput deltatime");
            this.global.delta = !this.global.delta;
        }
        if(e.message=="t!flying"){
            Call.sendChatMessage("Toggled flying for dpsBlock");
            this.global.dpsUnit.flying = !this.global.dpsUnit.flying;
        }
        if(e.message=="t!nopierce"){
            Call.sendChatMessage("Toggled piercing for dpsBlock");
            this.global.noPierce = !this.global.noPierce;
        }
    }));
}

print("Testing loaded successfully");
