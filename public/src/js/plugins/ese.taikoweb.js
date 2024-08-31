export default class Plugin extends Patch{
	name = "ESE(Disable if broken)"
	version = "22.03.07"
	ese_data_version = "220306"
	author = "Bui"

	loadEseSongs(){
		var promises = []

		this.addEdits(
			new EditValue(assets, "categoriesDefault").load(() => assets.categories),
			new EditValue(assets, "categories_ese").load(() => [{"aliases":["jpop", "j-pop", "pops"],"id":1,"title":"Pop","title_lang":{"cn":"流行音乐","en":"Pop","ja":"J-POP","ko":"POP","tw":"流行音樂"},"songSkin":{"background":"#219fbb","bg_img":"bg_genre_0.png","border":["#7ec3d3","#0b6773"],"outline":"#005058","sort":1,"infoFill":"#004d68"}},{"aliases":null,"id":2,"title":"Anime","title_lang":{"cn":"卡通动画音乐","en":"Anime","ja":"アニメ","ko":"애니메이션","tw":"卡通動畫音樂"},"songSkin":{"background":"#ff9700","bg_img":"bg_genre_1.png","border":["#ffdb8c","#e75500"],"outline":"#9c4100","sort":2,"infoFill":"#9c4002"}},{"aliases":["ボーカロイド曲","ボーカロイド","vocaloid music","vocaloid"],"id":3,"title":"VOCALOID™ Music","title_lang":{"en":"VOCALOID™ Music","ja":"ボーカロイド™曲"},"songSkin":{"background":"#def2ef","bg_img":"bg_genre_2.png","border":["#f7fbff","#79919f"],"outline":"#5a6584","sort":3,"infoFill":"#546184"}},{"aliases":["kids", "children", "folk"],"id":4,"songSkin":{"background":"#ff4e8a","bg_img":"bg_genre_kids.png","border":["#ffc1da","#c6004e"],"infoFill":"#a20024","outline":"#c3005c","sort":4},"title":"Kids'","title_lang":{"en":"Kids'","ja":"どうよう"}},{"aliases":["バラエティー"],"id":5,"title":"Variety","title_lang":{"cn":"综合音乐","en":"Variety","ja":"バラエティ","ko":"버라이어티","tw":"綜合音樂"},"songSkin":{"background":"#8fd321","bg_img":"bg_genre_3.png","border":["#f7fbff","#587d0b"],"outline":"#374c00","sort":5,"infoFill":"#3c6800"}},{"aliases":["クラッシック","classic"],"id":6,"title":"Classical","title_lang":{"cn":"古典音乐","en":"Classical","ja":"クラシック","ko":"클래식","tw":"古典音樂"},"songSkin":{"background":"#d1a016","bg_img":"bg_genre_4.png","border":["#e7cf6b","#9a6b00"],"outline":"#734d00","sort":6,"infoFill":"#865800"}},{"aliases":["game", "gamemusic"],"id":7,"title":"Game Music","title_lang":{"cn":"游戏音乐","en":"Game Music","ja":"ゲームミュージック","ko":"게임","tw":"遊戲音樂"},"songSkin":{"background":"#9c72c0","bg_img":"bg_genre_5.png","border":["#bda2ce","#63407e"],"outline":"#4b1c74","sort":7,"infoFill":"#4f2886"}},{"aliases":["namco", "namcooriginal"],"id":8,"title":"NAMCO Original","title_lang":{"cn":"NAMCO原创音乐","en":"NAMCO Original","ja":"ナムコオリジナル","ko":"남코 오리지널","tw":"NAMCO原創音樂"},"songSkin":{"background":"#ff5716","bg_img":"bg_genre_6.png","border":["#ffa66b","#b53000"],"outline":"#941c00","sort":8,"infoFill":"#961e00"}},{"title":"default","songSkin":{"background":"#ececec","border":["#fbfbfb","#8b8b8b"],"outline":"#656565","infoFill":"#656565"}}])
		)

		var image = document.createElement("img")
		image.id = "bg_genre_kids.png"
		image.src = "/assets/img/bg_genre_kids.png"
		loader.assetsDiv.appendChild(image)
		assets.image["bg_genre_kids"] = image
		this.bg_genre_kids = image
		promises.push(pageEvents.load(image))
	
		var subs = [
			["⒑", "10"],
			["⒒", "11"],
			["⒓", "12.5"],
			["⒕", "14"],
			["Ⅼ", "LO"],
			["Ⅾ", "DY"],
			["⁉", "!?"],
			["⁈", "?!"],
			["‼", "!!"],
			["‽", "!!!"],
			["❢", "!!!!"],
			["❣", "!!!!!"],
			["℣", "vs"],
			["☄", "☆彡"]
		]

		var removedSongs = assets.songsDefault.filter(song => song.maker === null)
		
		// Removes non-creative songs from the server songlist
		this.addEdits(
			new EditValue(assets, "songsDefault").load(() => assets.songsDefault.filter(song => song.maker !== null)),
			new EditValue(assets, "songs").load(() => assets.songsDefault)
		)

		promises.push(loader.ajax("https://nanshanyuyouhui269seahorse.on.drv.tw/taikosongsforweb/musicinfo.json").then(songs => {
			songs = JSON.parse(songs)
			songs.forEach(song => {
				var directory = "https://nanshanyuyouhui269seahorse.on.drv.tw/taikosongsforweb/" + song.id + "/"
				song.music = new RemoteFile(directory + "main.ogg")
				song.chart = new RemoteFile(directory + "main.tja")
				if(song.title === "Nesin Amatias"){
					song.preview = 0
					song.previewMusic = new RemoteFile("https://nanshanyuyouhui269seahorse.on.drv.tw/taikosongsforweb/preview_tor.ogg")
				}else if(song.title === "シン・ゾンビ"){
					song.preview = 0
					song.previewMusic = new RemoteFile("https://nanshanyuyouhui269seahorse.on.drv.tw/taikosongsforweb/preview_glyzmb.ogg")
				}else if(song.preview > 0){
					song.previewMusic = new RemoteFile(directory + "preview.ogg")
				}

				subs.forEach(sub => {
					song.title = song.title.replaceAll(sub[0], sub[1])
					if(song.subtitle) song.subtitle = song.subtitle.replaceAll(sub[0], sub[1])

					languageList.forEach(lang => {
						if(song.title_lang[lang]) song.title_lang[lang] = song.title_lang[lang].replaceAll(sub[0], sub[1])
						if(song.subtitle_lang[lang]) song.subtitle_lang[lang] = song.subtitle_lang[lang].replaceAll(sub[0], sub[1])
					})
				})
			})
			this.addEdits(
				new EditValue(assets, "songs_ese").load(() => songs)
			)
			this.fixScores(songs, removedSongs)
			this.log(songs.length + " songs loaded.")
		}))

		return promises
	}

	load(){
		var promises = this.loadEseSongs()

		this.addEdits(
			new EditValue(allStrings.ja, "ese").load(() => "本家曲リスト"),
			new EditValue(allStrings.en, "ese").load(() => "Official Song List"),
			new EditValue(allStrings.cn, "ese").load(() => "官方的曲列表"),
			new EditValue(allStrings.tw, "ese").load(() => "官方的曲列表"),
			new EditValue(allStrings.ko, "ese").load(() => "공식적인 노래 목록"),

			new EditValue(allStrings.ja.customSongs, "default").load(() => "創作曲リスト"),
			new EditValue(allStrings.en.customSongs, "default").load(() => "Creative Song List"),
			new EditValue(allStrings.cn.customSongs, "default").load(() => "创作曲列表"),
			new EditValue(allStrings.tw.customSongs, "default").load(() => "创作曲列表"),
			new EditValue(allStrings.ko.customSongs, "default").load(() => "창작 노래 목록"),

			new EditFunction(SongSelect.prototype, "init").load(str => {
				str = plugins.insertBefore(str,
				`if (!assets.customSongs) {
						this.songs.push({
						title: gameConfig.ese ? strings.customSongs.default : strings.ese,
						skin: this.songSkin.ese,
						action: "ese",
						category: strings.random
					})
				}
				`, `var showCustom = false`)
				str = plugins.insertBefore(str,
				`"ese": {
					sort: 0,
					background: "#FF6F63",
					border: ["#FFB2AB", "#A53D35"],
					outline: "#9C1F4F"
				},
				`,
				`"plugins": {`)

				str = plugins.insertAfter(str,
				`if(showCustom`, ` `)
				return str
			}),

			new EditFunction(SongSelect.prototype, "toCustomSongs").load(str => {
				str = plugins.insertBefore(str,
				`assets.categories = assets.categoriesDefault
				`,
				`delete assets.otherFiles`)
			
				return str
			}),

			new EditFunction(CustomSongs.prototype, "songsLoaded").load(str => {
				str = plugins.insertAfter(str,
				`this.clean()`,
				`
				if(gameConfig.ese){
					gameConfig.ese = false
					localStorage.setItem('ese', 'false')
				}`)
				return str
			}),

			new EditFunction(SongSelect.prototype, "redraw").load(str => {
				str = plugins.strReplace(str,
				`this.songs[index].action !== "random"`,
				`!(this.songs[index].action === "random" || this.songs[index].action === "ese")`)
				str = plugins.strReplace(str,
				`&& this.songs[index].action !== "random"`,
				`&& !(this.songs[index].action === "random" || this.songs[index].action === "ese")`)
				str = plugins.strReplace(str,
				`&& currentSong.action !== "random",`,
				`&& !(currentSong.action === "random" || currentSong.action === "ese"),`)
				return str
			}),

			new EditFunction(SongSelect.prototype, "displaySearch").load(str => {
				str = plugins.insertBefore(str,
				`if(["ja", "cn", "tw", "ko"].includes(strings.id)){
					var bar = this.search.div.querySelector(":scope #song-search-bar")
					var msg = document.createElement("div")
					msg.style = \`font-size: 1em;
					margin-top: 1em;
					text-align: center;
					background-repeat: no-repeat;
					background-position: top;
					background-size: 10em;
					background-color: #3228c287;
					border-radius: 0.5em;
					padding: 1em;\`
					msg.innerHTML = '曲タイトルの間違いにお気づきの方は、<a style="color:inherit" target="_blank" href="https://forms.gle/qobeTGmWNusWyWFJ8">こちら</a>までご報告ください！'
					bar.appendChild(msg)
				}
				`,
				`this.searchContainer =`)

				return str
			}),

			new EditFunction(SongSelect.prototype, "onsongsel").load(str => {
				str = plugins.insertAfter(str,
				`if("song" in response.value){`,
				`if(response.value.song === "ese" && response.value.player !== p2.player){
					this.playSound("se_don")
					this.clean()
					if (!gameConfig.ese) {
						assets.categories = assets.categories_ese
						assets.songs = assets.songs_ese
						gameConfig.ese = true
						localStorage.setItem('ese', 'true')
						setTimeout(() => {
							new SongSelect(true, false, this.touchEnabled)
						}, 500)
					} else {
						assets.categories = assets.categoriesDefault
						assets.songs = assets.songsDefault
						gameConfig.ese = false
						localStorage.setItem('ese', 'false')
						setTimeout(() => {
							new SongSelect(true, false, this.touchEnabled)
						}, 500)
					}
				}
				`)
				
				return str
			}),

			new EditFunction(SongSelect.prototype, "toSelectDifficulty").load(str => {
				str = plugins.strReplace(str,
				`&& currentSong.action !== "random")`,
				`&& !(currentSong.action === "random" || currentSong.action === "ese"))`)

				str = plugins.insertAfter(str,
				`var currentSong = this.songs[this.selectedSong]`,
				`
				if(p2.session && !fromP2 && currentSong.action === "ese"){
					p2.send("songsel", {
						song: "ese",
						selected: true
					})
					setTimeout(() => {
						p2.send("songsel", {
							song: 0,
							selected: false
						})
					}, 200)
				}
				`)

				str = plugins.insertAfter(str,
				`this.toSettings()`,
				`}else if(currentSong.action === "ese"){
					this.playSound("se_don")
					this.clean()
					if (!gameConfig.ese) {
						assets.categories = assets.categories_ese
						assets.songs = assets.songs_ese
						gameConfig.ese = true
						localStorage.setItem('ese', 'true')
						setTimeout(() => {
							new SongSelect("ese", false, this.touchEnabled)
						}, 500)
					} else {
						assets.categories = assets.categoriesDefault
						assets.songs = assets.songsDefault
						gameConfig.ese = false
						localStorage.setItem('ese', 'false')
						setTimeout(() => {
							new SongSelect("ese", false, this.touchEnabled)
						}, 500)
					}
				`)
				return str
			}),

			new EditFunction(Session.prototype, "onEnd").load(str => {
				str = plugins.insertBefore(str,
				`if (p2.session) {
					assets.categories = assets.categories_ese
					assets.songs = assets.songs_ese
					gameConfig.ese = true
					localStorage.setItem('ese', 'true')
				}
				`, `this.clean()`)
				return str
			}),

			new EditFunction(SongSelect.prototype, "onusers").load(str => {
				str = plugins.strReplace(str, `idDiff.id |0`, `idDiff.id`)
				str = plugins.strReplace(str,
				`return song.id === id`, `return song.hash === id`)
				return str
			}),

			new EditFunction(LoadSong.prototype, "setupMultiplayer").load(str => {
				str = plugins.strReplace(str,
				`id: song.folder`, `id: song.hash`)
				return str
			}),

			new EditFunction(Titlescreen.prototype, "init").load(str => {
				str = plugins.insertAfter(str,
				`if(songId){`,
				`	var ese = false
					if (songId > 100000) {
						this.songId -= 100000
						ese = true
					}
					if(ese){
						assets.categories = assets.categories_ese
						assets.songs = assets.songs_ese
						gameConfig.ese = true
						localStorage.setItem('ese', 'true')
					} else {
						assets.categories = assets.categoriesDefault
						assets.songs = assets.songsDefault
						gameConfig.ese = false
						localStorage.setItem('ese', 'false')
					}

				`)

				return str
			}),

			new EditFunction(Titlescreen.prototype, "goNext").load(str => {
				str = plugins.insertBefore(str,
				`if(p2.session && p2.player === 2){
					assets.categories = assets.categories_ese
					assets.songs = assets.songs_ese
					gameConfig.ese = true
				}
				`,
				`if(p2.session && !fromP2){`)

				str = plugins.insertBefore(str,
				`if (localStorage.getItem('ese') !== 'false') {
					assets.categories = assets.categories_ese
					assets.songs = assets.songs_ese
					gameConfig.ese = true
				}
				`,
				'\n\t\t\t\t\tsetTimeout(() => {')

				str = plugins.insertBefore(str,
				`if (localStorage.getItem('ese') !== 'false') {
					assets.categories = assets.categories_ese
					assets.songs = assets.songs_ese
					gameConfig.ese = true
				}
				`,
				`new SettingsView`)

				return str
			}),

		)

		return Promise.all(promises)
	}

	fixScores(songsEse, removedSongs){
		var hashMap = {}
		var fixedTitles = {
			"Onpu no Uta": "Onpu no Uta -CS4 Version-",
			"Kuro Vyrn no Tsubasa": "Kuro Vyrn no Tsubasa MANIAC",
			"GO MY WAY!!": "GO MY WAY!! -765PRO ALLSTARS Version-",
			"Hibike! Taiko no Tatsujin (Full Ver)": "Hibike! Taiko no Tatsujin -Long Version-",
			"Haryu": "Dragon of Spring ～Haryu～",
			"Kirari☆彡 Star☆Twinkle Precure": "Kirari☆彡Star☆Twinkle Pretty Cure",
			"DOKU LO CANdy♡": "DOQLOCANDY♡",
			"A Cruel Angel's Thesis": "A Cruel Angel’s Thesis -New Audio-",
			"Fun-Filled Drum-Filled Taiko Dojo": "Tanoshii Taiko Dojo",
			"Bad Apple!! feat.nomico": "Bad Apple!!",
			"Atsumare Taiko Matsuri!": "Atsumare☆Taiko Matsuri!",
			"Dokidoki Don-chan Sawagi": "Dokidoki☆Don-chan Sawagi",
			"Kero⑨destiny": "Kero⑨Destiny",
			"Gigantic O.T.N": "Gigantic O.T.N.",
			"Caramelldansen": "Caramelldansen (°∀°)",
			"Plus Danshi": "+♂ -Plus Danshi-",
			"poxei♦DOON": "poxei♢DOON",
			"Don't say \"lazy\"": "Don’t say “lazy”",
		}
		songsEse.forEach(songEse => {
			var enEse = songEse.title_lang.en || songEse.title
			var jaEse = songEse.title_lang.ja || songEse.title
			removedSongs.forEach(songLocal => {
				var enLocal = songLocal.title_lang.en || songLocal.title
				var jaLocal = songLocal.title_lang.ja || songLocal.title
				if(enLocal in fixedTitles && fixedTitles[enLocal] === enEse || enEse === enLocal || jaEse === jaLocal){
					this.mergeScore(songEse.hash, songLocal.hash)
				}
			})
		})
	}

	mergeScore(hashEse, hashLocal){
		var scoreLocal = scoreStorage.get(hashLocal, undefined, true)
		if(scoreLocal){
			var save = false
			var scoreEse = scoreStorage.get(hashEse, undefined, true) || {}
			for(var i in scoreLocal){
				if(scoreLocal[i].crown && (!(i in scoreEse) || scoreEse[i].crown !== "gold")){
					var score = scoreEse[i] || {
						points: 0,
						good: 0,
						ok: 0,
						bad: 0,
						maxCombo: 0,
						drumroll: 0
					}
					score.crown = scoreLocal[i].crown
					scoreEse[i] = score
					save = true
				}
			}
			if(save){
				scoreStorage.scores[hashEse] = scoreEse
				scoreStorage.writeString(hashEse)
			}
		}
	}

	unload(){
		loader.assetsDiv.removeChild(this.bg_genre_kids)
		delete this.bg_genre_kids
	}
}
