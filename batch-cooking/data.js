const MEALS = [
    // Hiver
    { id: 101, title: "Raclette", ingredients: ["fromage à raclette", "pommes de terre", "charcuterie", "oignons"] },
    { id: 102, title: "Fondue savoyarde", ingredients: ["fromage", "pain", "ail", "vin blanc"] },
    { id: 103, title: "Pot-au-feu", ingredients: ["bœuf", "carottes", "poireaux", "pommes de terre"] },
    { id: 104, title: "Tartiflette", ingredients: ["reblochon", "pommes de terre", "lardons", "oignons"] },
    { id: 105, title: "Bœuf bourguignon", ingredients: ["bœuf", "vin rouge", "carottes", "champignons"] },
    { id: 106, title: "Soupe à l’oignon", ingredients: ["oignons", "pain", "fromage", "bouillon"] },
    { id: 107, title: "Cassoulet", ingredients: ["haricots blancs", "saucisses", "confit de canard", "tomates"] },
    { id: 108, title: "Gratin dauphinois", ingredients: ["pommes de terre", "crème", "ail", "lait"] },
    { id: 109, title: "Chili con carne", ingredients: ["bœuf haché", "haricots rouges", "tomates concassées", "oignons"] },
    { id: 110, title: "Blanquette de veau", ingredients: ["veau", "carottes", "champignons", "crème"] },

    // Été
    { id: 201, title: "Salade niçoise", ingredients: ["thon", "œufs", "tomates", "haricots verts"] },
    { id: 202, title: "Gazpacho", ingredients: ["tomates", "concombre", "poivrons", "oignons"] },
    { id: 203, title: "Taboulé", ingredients: ["semoule", "tomates", "concombre", "menthe"] },
    { id: 204, title: "Tian de légumes", ingredients: ["courgette", "aubergine", "tomates", "oignons"] },
    { id: 205, title: "Brochettes de poulet", ingredients: ["blanc de poulet", "poivrons", "oignons", "tomates"] },
    { id: 206, title: "Poke bowl", ingredients: ["riz", "saumon", "avocat", "concombre"] },
    { id: 207, title: "Melon-jambon cru", ingredients: ["melon", "jambon cru", "roquette", "mozzarella"] },
    { id: 208, title: "Ratatouille", ingredients: ["courgette", "aubergine", "poivrons", "tomates"] },
    { id: 209, title: "Wraps au saumon", ingredients: ["saumon fumé", "tortillas", "crème", "concombre"] },
    { id: 210, title: "Carpaccio de bœuf", ingredients: ["bœuf", "parmesan", "roquette", "citron"] },

    // Automne
    { id: 301, title: "Velouté de potimarron", ingredients: ["potimarron", "crème", "oignons", "châtaignes"] },
    { id: 302, title: "Quiche aux champignons", ingredients: ["pâte brisée", "champignons", "œufs", "crème"] },
    { id: 303, title: "Risotto aux cèpes", ingredients: ["riz arborio", "champignons", "parmesan", "vin blanc"] },
    { id: 304, title: "Parmentier de canard", ingredients: ["canard confit", "pommes de terre", "oignons", "crème"] },
    { id: 305, title: "Poulet rôti aux légumes", ingredients: ["blanc de poulet", "carottes", "pommes de terre", "oignons"] },
    { id: 306, title: "Tarte aux poireaux", ingredients: ["pâte brisée", "poireaux", "œufs", "crème"] },
    { id: 307, title: "Curry de lentilles", ingredients: ["lentilles", "lait de coco", "oignons", "carottes"] },
    { id: 308, title: "Gratin de courge", ingredients: ["courge", "crème", "fromage", "chapelure"] },
    { id: 309, title: "Pâtes aux champignons", ingredients: ["spaghetti", "champignons", "crème", "parmesan"] },
    { id: 310, title: "Tourte forestière", ingredients: ["pâte feuilletée", "champignons", "blanc de poulet", "crème"] },

    // Printemps
    { id: 401, title: "Quiche aux asperges", ingredients: ["pâte brisée", "asperges", "œufs", "crème"] },
    { id: 402, title: "Risotto aux petits pois", ingredients: ["riz arborio", "petits pois", "parmesan", "menthe"] },
    { id: 403, title: "Salade de chèvre chaud", ingredients: ["chèvre", "pain", "laitue", "miel"] },
    { id: 404, title: "Omelette aux herbes", ingredients: ["œufs", "ciboulette", "persil", "fromage"] },
    { id: 405, title: "Tarte aux légumes printaniers", ingredients: ["pâte brisée", "petits pois", "asperges", "courgette"] },
    { id: 406, title: "Poulet citron-romarin", ingredients: ["blanc de poulet", "citron", "romarin", "pommes de terre"] },
    { id: 407, title: "Pâtes au pesto", ingredients: ["spaghetti", "basilic", "parmesan", "pignons de pin"] },
    { id: 408, title: "Bowl de légumes verts", ingredients: ["quinoa", "brocoli", "petits pois", "avocat"] },
    { id: 409, title: "Clafoutis salé", ingredients: ["œufs", "lait", "tomates cerises", "fromage de chèvre"] },
    { id: 410, title: "Poisson en papillote", ingredients: ["filets de saumon", "courgette", "citron", "tomates"] },

    // Rapides
    { id: 601, title: "Croque-monsieur", ingredients: ["pain", "jambon", "fromage", "béchamel"] },
    { id: 602, title: "Pâtes carbonara", ingredients: ["spaghetti", "lardons", "œufs", "parmesan"] },
    { id: 603, title: "Omelette", ingredients: ["œufs", "fromage", "fines herbes"] },
    { id: 604, title: "Quesadillas", ingredients: ["tortillas", "fromage", "blanc de poulet", "poivrons"] },
    { id: 605, title: "Nouilles sautées", ingredients: ["spaghetti", "blanc de poulet", "carottes", "brocoli"] },
    { id: 606, title: "Salade César", ingredients: ["laitue", "blanc de poulet", "croûtons", "parmesan"] },
    { id: 607, title: "Burger maison", ingredients: ["bœuf haché", "pain burger", "fromage", "tomates"] },
    { id: 608, title: "Tacos", ingredients: ["bœuf haché", "tortillas", "laitue", "tomates"] },
    { id: 609, title: "Pizza tortilla", ingredients: ["tortillas", "tomates concassées", "fromage", "basilic"] },
    { id: 610, title: "Sandwich club", ingredients: ["pain", "blanc de poulet", "laitue", "œufs"] }
];
