Vue.component('playerbanner', {
    template: `
        <div class="col-12 col-md-6 col-xl-12">
                        <div id="selectedPlayer1">
                            <div id="p1name" class="playerName">
                                
                            </div>
                            <div class="playerPoints">
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-md-6 col-xl-12">
                        <div id="selectedPlayer2">
                            <div id="p2name" class="playerName">
                            </div>
                            <div class="playerPoints">
                                <p id="p1Points">0 Pts</p>
                            </div>
                        </div>
                    </div>
    `,

})

Vue.component('toolbar', {
    template: `
         <div className="row">
        <div className="col-sm-1 col-md-2 col-lg-3 col-xl-4"></div>
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-4">
        <section className="centerToolbar">
            <div id="l" className="left-background">
                <button className="toolbar-button" instruction="l" onClick="calc(this);"></button>
            </div>
            <div id="wait" className="pause-background">
                <button className="toolbar-button" instruction="wait" onClick="calc(this);"></button>
            </div>
            <div id="r" className="right-background">
                <button className="toolbar-button" instruction="r" onClick="calc(this);"></button>
            </div>
        </section>
        </div>
        <div className="col-sm-1 col-md-2 col-lg-3 col-xl-4"></div>
    </div>
    `,

})
Vue.component('cardpreview', {
    template: `
        <div class="row">
            <div class="col-2 col-xl-3"></div>
            <div class="col-10 col-xl-9">
                <div class="row">
                    <div class="col-10 col-xl-8">
                        <div class="row">
                            <div class="col-xl-2"></div>
                            <div class="col-12 col-xl-8">
                                <div class="title">
                                    <img src="@routes.Assets.versioned("images/title.png")" width="600">
                                </div>
                            </div>
                            <div class="col-xl-2"></div>
                        </div>
                    </div>
                    <div class="col-2 col-xl-4">
                        <a href="home">
                            <button class="home-button"></button>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    `,

})

Vue.component('playergrid', {
    template: `
        <div class="row">
                    <div class="col-12 col-xl-8">
                        <section class="mapWrapper">
                            @for(y <- 0 until 6) {
                                <div class="row">
                                @for(x <- 0 until 12) {
                                    <div id="@x @y" class="col-1 grid-hover" instruction="0" x="@x" y="@y" onclick="calc(this);">
                                        <img src=@routes.Assets.versioned(supervisor.controller.ImagePath(supervisor.map.field(x)(y), supervisor.card)) >
                                    </div>
                                }
                                </div>
                            }
                        </section>
                    </div>
                    <div class="col-6 col-xl-4">
                        <div class="cardPreview-background" id="newcard">
                            <img id="preview" src="@routes.Assets.versioned(s)" class="card-preview">
                        </div>
                    </div>
                </div>
    `
})



$(document).ready(function () {
    var game = new Vue({
        el: '#game'
    })

})