const mechTester = extendContent(Block, "mech-tester", {
    //hacky way because configured() only uses int
    //everything else is done in configured() because it is a serverside method
    buildConfiguration(tile, table){
        table.addImageButton(Icon.wrench, Styles.clearTransi, run(() => {
            this.pick(tile)
        })).size(50).disabled(boolf(b => tile.ent() == null));

        table.addImageButton(Icon.defense, Styles.clearTransi, run(() => {
            Vars.ui.showTextInput("Team", "Set Team", 3, Vars.player.team.id, cons(input => tile.configure(parseInt(input) + Vars.content.getBy(ContentType.mech).size)));
        })).size(50).disabled(boolf(b => tile.ent() == null));
    },
    pick(tile){
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
                    tile.configure(type.id)
                    dialog.hide();
                })).pad(2).margin(12).fillX();
                if(++i % 3 == 0) p.row();
            }));
        }));

        dialog.show();
    },
    configured(tile, player, value){
        if(value > Vars.content.getBy(ContentType.mech).size) {
            player.team = Team.get(value - Vars.content.getBy(ContentType.mech).size);
        } else {
            player.mech = Vars.content.getByID(ContentType.mech, value)
        }
    }
});

mechTester.health = 1;
mechTester.solid = false;
mechTester.configurable = true;
mechTester.buildVisibility = BuildVisibility.sandboxOnly;
mechTester.requirements(Category.upgrade, ItemStack.with(Items.copper, 1));
mechTester.size = 1;
mechTester.update = true;
mechTester.localizedName = "Mech Tester";
mechTester.description = "";
