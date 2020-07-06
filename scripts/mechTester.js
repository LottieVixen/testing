const mechTester = extendContent(Block, "mech-tester", {
    buildConfiguration(tile, table){
        table.addImageButton(Icon.wrench, Styles.clearTransi, run(() => {
            tile.configure(0);
        })).size(50).disabled(boolf(b => tile.entity == null));

        table.addImageButton(Icon.defense, Styles.clearTransi, run(() => {
            tile.configure(1);
        })).size(50).disabled(boolf(b => tile.entity == null));
    },
    pick(tile, player){
        const dialog = new FloatingDialog("");
        dialog.setFillParent(true);
        dialog.cont.pane(cons(p => {
            var i = 0;
            var mechs = Vars.content.getBy(ContentType.mech);

            mechs.each(cons(type => {
                p.addButton(cons(t => {
                    t.left();
                    t.addImage(type.icon(Cicon.medium)).size(40).padRight(2);
                    t.add(type.localizedName);
                }), run(() => {
                    player.mech = type;
                    dialog.hide();
                })).pad(2).margin(12).fillX();
                if(++i % 3 == 0) p.row();
            }));
        }));

        dialog.show();
    },
    configured(tile, player, value){
        //yes im terrible at this
        var handle = [
            (tile, player) => this.pick(tile, player),
            (tile, player) => Vars.ui.showTextInput("", "", 3, player.team.id, cons(input => player.team = Team.get(input.valueOf()) ))
        ];

        handle[value](tile, player);
    }
});

mechTester.health = 1;
mechTester.solid = false;
mechTester.configurable = true;
mechTester.buildVisibility = BuildVisibility.sandboxOnly;
mechTester.requirements = [new ItemStack(Items.copper, 1)];
mechTester.size = 1;
mechTester.update = true;
mechTester.localizedName = "Mech Tester";
mechTester.description = "";
