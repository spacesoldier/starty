'use strict'


const startyVersion = '0.1.2';

// pseudographic text generated by: https://patorjk.com/software/taag

function startyGreeting(){
    const greeting = `` +
        `
   _____   __                    __          
  / ___/  / /_  ____ _   _____  / /_   __  __
  \\__ \\  / __/ / __ \`/  / ___/ / __/  / / / /
 ___/ / / /_  / /_/ /  / /    / /_   / /_/ / 
/____/  \\__/  \\__,_/  /_/     \\__/   \\__, /  
                                    /____/   
` +
        //         `
        //   _________   __                        __
        //  /   _____/ _/  |_  _____    _______  _/  |_   ___.__.
        //  \\_____  \\  \\   __\\ \\__  \\   \\_  __ \\ \\   __\\ <   |  |
        //  /        \\  |  |    / __ \\_  |  | \\/  |  |    \\___  |
        // /_______  /  |__|   (____  /  |__|     |__|    / ____|
        //         \\/               \\/                    \\/
        // ` +
        // `
        //   _________ __                 __
        //  /   _____//  |______ ________/  |_ ___.__.
        //  \\_____  \\\\   __\\__  \\\\_  __ \\   __<   |  |
        //  /        \\|  |  / __ \\|  | \\/|  |  \\___  |
        // /_______  /|__| (____  /__|   |__|  / ____|
        //         \\/           \\/             \\/
        // ` +
        //         `
        //   _________  __                     __
        //  /   _____/_/  |_ _____   _______ _/  |_  ___.__.
        //  \\_____  \\ \\   __\\\\__  \\  \\_  __ \\\\   __\\<   |  |
        //  /        \\ |  |   / __ \\_ |  | \\/ |  |   \\___  |
        // /_______  / |__|  (____  / |__|    |__|   / ____|
        //         \\/             \\/                 \\/
        // ` +
        //         `
        //
        //       _/_/_/      _/                                    _/
        //    _/          _/_/_/_/       _/_/_/      _/  _/_/   _/_/_/_/      _/    _/
        //     _/_/        _/         _/    _/      _/_/         _/          _/    _/
        //        _/      _/         _/    _/      _/           _/          _/    _/
        // _/_/_/          _/_/       _/_/_/      _/             _/_/        _/_/_/
        //                                                                      _/
        //                                                                 _/_/
        // ` +
        `\t version ${startyVersion}\n\n`;
    console.log(greeting);
}



module.exports = {
    startyGreeting
}
