// System of axes:
// 	X => left => width;
// 	Y => top => height;
//  G => gravity / (2 *Math.PI)
// http://yotx.ru/#!1/3_h/ubFwcH%40xcHB/tGDOF/bf9of3PrYH/rYN%40IIfyv7W8drB%40A97Y39tZ3NnfODtZ3dtd39g/2STTsxs4p4/F0i/G4dXmxu7%401v3WwjgDvbW/sre9s7pwdrO/sru/sH%40yTaNiNA8bj1sUp4/Fgd39rf%40sAvLGzt72xt74D3drd3T/YJ9GwG1swBOPxgPF4sLu/tQ8E
// http://yotx.ru/#!1/3_h/ubWwcH%401sHB/tGDOF/bf9of3PrYH/rYN%40IIfyv7W8dbOzsbW/sre9At3Z3N7cO1g/Ae9sbe%40s7mztnB%40s7u%40s7%40wf7JBp2Y%40tyi/G4dXDJeNy52Nnd39rfOtjY2dve2FvfgW7t7m5uHawjwHvbG3vrO5s7ZwfrO7vrO/sH%40yQadgN0wHjcAW0xHkEHu/tb%40wA=
var space_2d = {
	radius: 300, speed: 300,
	cnsts: {
		G: 35, GF: 7, push: true,
		fix: {cnt: 5, rndm: 3, round: true}
	},
	xy: [
		[0, 1],
		[0, -1],
		[1, 0],
		[1, 1],
		[1, -1],
		[-1, 0],
		[-1, 1],
		[-1, -1]
	], //(Math.random() *8)^0
	objects: [], obj_proto: {
		X: 0, Y: 0, M: 9,
		getM: function() {
			return this.M;
		},
		setM: function(mass) {
			var old_M = this.M;
			this.M = mass<0 ? 0 : mass;
			if(this.hasOwnProperty('$')) {
				this.$.width(this.M *2 +1);
				this.$.height(this.M *2 +1);
				this.$.css({borderRadius: this.M +1});
				this.$.offset({
					left: this.$.offset().left +old_M -this.M,
					top: this.$.offset().top +old_M -this.M
				});
			} else {
				var self = this;
				$('.object-point').each(function() {
					if(!$(this).hasClass('mark')) {
						$(this).width(self.M *2 +1);
						$(this).height(self.M *2 +1);
						$(this).css({borderRadius: self.M +1});
						$(this).offset({
							left: $(this).offset().left +old_M -self.M,
							top: $(this).offset().top +old_M -self.M
						});
					}
				});
			}
		},

		fix: function(radius) {
			var r2 = radius*radius;
			if(this.force.X*this.force.X
			  +this.force.Y*this.force.Y
			  > r2) {
				var v = {
					'a': [this.X              , this.Y],
					'b': [this.force.X        , this.force.Y],
					'c': [this.force.X -this.X, this.force.Y -this.Y]
				}
				var a2 = v['a'][0]*v['a'][0] + v['a'][1]*v['a'][1];	var a = Math.sqrt(a2);
				var b2 = v['b'][0]*v['b'][0] + v['b'][1]*v['b'][1];	var b = Math.sqrt(b2);
				var c2 = v['c'][0]*v['c'][0] + v['c'][1]*v['c'][1];	var c = Math.sqrt(c2);

				var p = (a+b+c)/2;
				var h2 = 4*p*(p-a)*(p-b)*(p-c) /c2;
				var l = c -Math.sqrt(b2-h2) +Math.sqrt(r2-h2);
				this.force.X = v['a'][0] + v['c'][0]*l/c;
				this.force.Y = v['a'][1] + v['c'][1]*l/c;
			}
		},
		move: function(space) {
			this.fix(space.radius);
			var delta_force = {
				X: this.force.X -this.X,
				Y: this.force.Y -this.Y
			};
			if(space.cnsts.fix.round) {
				this.X = Math.round(this.force.X);
				this.Y = Math.round(this.force.Y);
			} else {
				this.X = this.force.X;
				this.Y = this.force.Y;
			}
			this.force.X += delta_force.X;
			this.force.Y += delta_force.Y;
			this.$.offset({
				left: space.$.offset().left +space.radius +this.X -this.M,
				top:  space.$.offset().top  +space.radius +this.Y -this.M
			});
		}
	},

	init: function($this) {
		this.$ = $this;
		this.setup();
		return this;
	},
	setup: function(radius = 0, cnt = 0) {
		if(radius > 9)
			this.radius = radius;

		this.$.width(this.radius *2 +1);
		this.$.height(this.radius *2 +1);
		this.$.css({borderRadius: this.radius +1});

		if(cnt > 0) {
			this.$.empty(); this.objects = [];
			for(var i = 0; i < cnt; i++) {
				var obj = {__proto__: this.obj_proto,
					id: i, force: {X: 0, Y: 0},
					$: $('<a href="javascript:;" id="object-'
						+i+'" class="object-point"></a>')
				}
				if(i) {
					var obj_xy = this.xy[(Math.random() *8)^0];
					obj.force = {X: i *obj_xy[0], Y: i *obj_xy[1]};
				}
				this.objects.push(obj);
				this.$.append(obj.$);
				obj.move(this);

				// if(this.collision(obj))
				// 	console.log("Error in #"+i, obj);
			}
		}
		return this;
	},
	collision: function(obj) {
		for(var i = 0; i < this.objects.length; i++) {
			if(obj != this.objects[i]
			&& obj.X == this.objects[i].X
			&& obj.Y == this.objects[i].Y
			) return true;
		}
		return false;
	},
	motion: function() {
		try {
			for(var i = 0; i < this.objects.length; i++) {
				this.objects[i].move(this);
				// if(this.collision(this.objects[i]))
				// 	console.log("Error in #"+i, this.objects[i]);
			}
			for(var i = 0; i < this.objects.length; i++) {
				this.objForce(this.objects[i]);
			}
		} catch (err) {
			console.log(err);
		}
		return this;
	},

	objForce: function(obj) {
		var force = {X: 0, Y: 0};
		for(var i = 0; i < this.objects.length; i++) {
			if(obj != this.objects[i]
					&& isFinite(this.objects[i].X)
					&& isFinite(this.objects[i].Y)) {
				var lX = obj.X - this.objects[i].X;
				var lY = obj.Y - this.objects[i].Y;
				var l2 = lX*lX + lY*lY, l = Math.sqrt(l2);
				var f = this.cnsts.G *this.objects[i].M
							/ (l2 +this.objects[i].M);
				force.X += lX *f;
				force.Y += lY *f;
			}
		}

		var l2 = obj.X*obj.X
				+obj.Y*obj.Y;
		if(l2 > 0) {
			var l = Math.sqrt(l2);
			var f = this.cnsts.G *this.getBGF(l2);
			force.X -= obj.X *f;
			force.Y -= obj.Y *f;
		}

		if(isFinite(force.X) && isFinite(force.Y))
			if(!this.cnsts.push) {
				obj.force.X -= force.X / obj.M;
				obj.force.Y -= force.Y / obj.M;
			} else {
				obj.force.X += force.X / obj.M;
				obj.force.Y += force.Y / obj.M;
			}
		return force;
	},

	getBGF: function(l2) {
		var r2 = this.radius*this.radius;
		return Math.pow(10, this.cnsts.GF)
			  / ((l2 - 2*r2) * (l2 - 2*r2));
	}
};

(function($) {
	$(document).ready(function() {
		space_2d.init($('#space-2d'));
		space_2d.$.on('click', '.object-point', function(e) {
			var obj_id = parseInt(this.id.replace(/object-/g, ''));
			$('.object-point').removeClass('active');
			$('#correct-2').data('obj-id', null);
			$('#obj-id').val(obj_id);
			$('#correct-2').click();
		});
		space_2d.$.on('contextmenu', '.object-point', function(e) {
			var obj_id = parseInt(this.id.replace(/object-/g, ''));
			var obj = space_2d.objects[obj_id];
			for(var cnt = 0, i = 0; i < space_2d.objects.length; i++) {
				if(obj != space_2d.objects[i]
				&& obj.X == space_2d.objects[i].X
				&& obj.Y == space_2d.objects[i].Y
				) {
					cnt++;
					var obj_xy = space_2d.xy[(Math.random() *8)^0];
					space_2d.objects[i].force = {X: obj.X +(i *obj_xy[0]), Y: obj.X +(i *obj_xy[1])};
				}
			}
			return false;
		});

		$('#correct-1').click(function() {
			space_2d.cnsts.G = parseInt($('#cnst-gravity').val());
			space_2d.cnsts.GF = parseFloat($('#cnst-bhole').val());
			space_2d.cnsts.push = $('#cnst-push').prop('checked');
			space_2d.obj_proto.setM(parseInt($('#def-mass').val()));

			space_2d.cnsts.fix.cnt = parseInt($('#fix-cnt').val());
			space_2d.cnsts.fix.rndm = parseInt($('#fix-rndm').val());
			space_2d.cnsts.fix.round = $('#fix-round').prop('checked');
		});
		$('#correct-2').click(function() {
			var obj_id = $('#obj-id').val();
			if(obj_id == null || obj_id === ''
				|| space_2d.objects[obj_id] == null) return;

			var obj = space_2d.objects[obj_id];
			if($('#correct-2').data('obj-id') == null) {
				if(space_2d.motionId != null) {
					space_2d.motionPause = true;
					$('#stop').click();
				}

				$('#obj-id').prop('disabled', true);
				$('#correct-2').data('obj-id', obj_id);
				obj.$.addClass('active');

				$('#mass').prop('disabled', false);
				$('#force-x').prop('disabled', false);
				$('#force-y').prop('disabled', false);

				$('#mass').val(obj.getM());
				$('#force-x').val(obj.force.X);
				$('#force-y').val(obj.force.Y);
				$('#force-x').attr('title', obj.X);
				$('#force-y').attr('title', obj.Y);

			} else {
				$('#obj-id').prop('disabled', false);
				$('#correct-2').data('obj-id', null);
				obj.$.removeClass('active');

				$('#mass').prop('disabled', true);
				$('#force-x').prop('disabled', true);
				$('#force-y').prop('disabled', true);

				obj.setM(parseInt($('#mass').val()));
				if(space_2d.obj_proto.M == obj.M) {
					obj.$.removeClass('mark');
					delete obj.M;
				} else {
					obj.$.addClass('mark');
				}
				obj.force.X = parseFloat($('#force-x').val());
				obj.force.Y = parseFloat($('#force-y').val());
				if(space_2d.motionPause) {
					space_2d.motionPause = false;
					$('#run').click();
				}
			}
		});

		$('#reset').click(function() {
			var cnt = parseInt($('#objs').val());
			var radius = parseInt($('#radius').val());
			space_2d.speed = parseInt($('#speed').val());
			$('#stop').click();

			space_2d.setup(radius, cnt);
			$('.object-point').draggable({
				start: function(event, ui) {
					if(space_2d.motionId != null) {
						space_2d.motionPause = true;
						$('#stop').click();
					}
				},
				stop: function(event, ui) {
					var obj_id = parseInt(this.id.replace(/object-/g, ''));
					space_2d.objects[obj_id].force.X -= ui.originalPosition.left - ui.position.left;
					space_2d.objects[obj_id].force.Y -= ui.originalPosition.top - ui.position.top;
					if(space_2d.motionPause) {
						space_2d.motionPause = false;
						$('#run').click();
					}
				}
			});
		});
		$('#stop').click(function() {
			clearInterval(space_2d.motionId);
			space_2d.motionId = null;
		});
		$('#run').click(function() {
			space_2d.motionId = setInterval(
				function() {
					try {
						space_2d.motion();
					} catch (err) {
						console.log(err);
					}
				},
				space_2d.speed);
		});



		// $('#correct-1').click();
		// var cnt = space_2d.objects.length;
		// var obj = {__proto__: space_2d.obj_proto, id: cnt,
		// 	$: $('#object-0'), X: -100, Y: -150
		// }
		// space_2d.objects.push(obj);

	});
})(jQuery)
