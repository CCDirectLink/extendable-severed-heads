
export default class ExtendableHeads extends Plugin  {
	async prestart() {
		
		// Image loaded successfully
		const oldImage = await this.loadImage("media/gui/severed-heads.png");

		const {headIdx} = await this.getHeadIdx();
		let imgs = [oldImage];
		
	
		// assume each image is 24x24
		for (let index = 0; index < headIdx.length; ++index) {
			const head = headIdx[index];
			try {
				imgs.push((await this.loadImage(head.img)));
			} catch (e) {
				headIdx.splice(index, 1);
				--index;
				console.log(`Cound not load head of "${head.id}"`);
				console.log(e);
			}
		}

		let dim = this.getTotalDim(imgs);
		
		const newImage = await this.mergeImages(imgs, dim);
		dim = this.getTotalDim([newImage]);

		
		const startIndex = this.calcStartIndex(dim, headIdx);

		const customIdx = {};

		for (let index = 0; index < headIdx.length; ++index) {
			const head = headIdx[index];
			customIdx[head.id] = startIndex + index;
		}

		sc.PlayerConfig.inject({
			onload: function(config) {
				if (!config.jsonTEMPLATES) {
					const id = config.character;
					if (id in customIdx) {
						config.headIdx = customIdx[id];
					}
				}
				this.parent(config);
			}
		});


		const img = new ig.Image("media/gui/severed-heads.png");
		img.addLoadListener({
			onLoadableComplete: function(loaded, image) {
				// replace image
				if (loaded) {
					if (!image.failed) {
						image.data = newImage;
					}
					
				}
			}
		});

	}
	async loadImage(src) {
		let imgData = new Image;
		

		await new Promise((resolve, reject) => {
			imgData.onload = () => {
				resolve();
			};

			imgData.onerror = () => {
				reject();
			};

			imgData.src = src;
		});
		return imgData;
	}

	getTotalDim(imgs) {
		let dim = {
			x: 0,
			y: 0
		};
		for (const img of imgs) {
			dim.x += img.width;
			dim.y = Math.max(dim.y, img.height);
		}
		return dim;
	}
	async mergeImages(imgs, dim) {
		const canvas = document.createElement("canvas");
		
		
		// preset canvas

		// normalize the width
		canvas.width = (24 - (dim.x%24)) + dim.x;
		canvas.height = dim.y;
		const ctx = canvas.getContext("2d");
		let x = 0;

		// want to go by a factor of 24
		// go one by one
		for (const img of imgs) {
			ctx.drawImage(img, x, 0);
			// this will normalize the dimensions
			const remainder = (24 - (img.width%24));
			x += img.width + remainder;
		}
		return await this.loadImage(canvas.toDataURL("image/png"));
	}

	calcStartIndex(dim, extraImgs) {
		// assume each head is 24x24
		return (dim.x - (extraImgs.length * 24))/24;
	}

	getHeadIdx() {
		return new Promise((resolve, reject) => {
			$.ajax({
				dataType: "json",
				url: "data/players/headIdx.json",
				success: (data) => {
					resolve(data)
				},
				error: () => {
					reject();
				}			
			})
		});
	}

}