
export default class ExtendableHeads extends Plugin  {
	async prestart() {

		let imgData = new Image;
		

		await new Promise((resolve, reject) => {
			imgData.onload = () => {
				resolve();
			};

			imgData.onerror = () => {
				reject();
			};

			imgData.src = "media/gui/severed-heads.png";
		});

		// Image loaded successfully
		


		img.addLoadListener({
			onLoadableComplete: function(loaded, image) {
				// replace image
				if (loaded) {
					if (image.failed) {
						reject();
					} else {
						resolve(image);
					}
					
				}
			}
		})

		console.log(imgData);

	}

}