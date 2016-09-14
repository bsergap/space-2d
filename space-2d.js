// System of axes:
//    posX => left; posY => top;
//    maxX => width; maxY => height;
var space = {
	maxX: 0, maxY: 0,
	offsetX: 0, offsetY: 0,
	list: [], obj_proto: {
		posX: 0, posY: 0, mass: 1
	},
	cnst: {
		C: 10,
		speed: 500,
		round: false,
		fix: {cnt: 10, rndm: 5}
	},
	init: function() {
		space.maxX = this.$.width() -1;
		space.maxY = this.$.height() -1;
		space.offsetX = this.$.offset().left;
		space.offsetY = this.$.offset().top;
		return this;
	},
	fill: function(cnt) {
		this.$.empty(); this.list = [];
		for(var c = 0; c < cnt; c++) {
			this.create().motion();
		}
	},

	create: function() {
		var cnt = this.list.length;
		var obj = {__proto__: this.obj_proto, id: cnt,
			$: $('<a href="javascript:;" id="object-'+
				cnt+'" class="object-point"></a>')
		}
		if(cnt > 0) {
			obj.posX = this.maxX /2;
			obj.posY = this.maxY /2;
		}
		this.$.append(obj.$);
		this.list.push(obj);
		return this;
	},
	motion: function() {
		for(var c = 0; c < this.list.length; c++) {
			var force = this.objGetForce(this.list[c]);
			this.list[c].posX += force.X / this.list[c].mass;
			this.list[c].posY += force.Y / this.list[c].mass;
			this.list[c].force = force;
			this.objMove(this.list[c]);
		}
		return this;
	},
	objFix: function(obj) {
		if(obj.posX < 0) obj.posX = 0;
		if(obj.posY < 0) obj.posY = 0;
		if(obj.mass < 0) obj.mass = 1;
		if(obj.posX > this.maxX) obj.posX = this.maxX;
		if(obj.posY > this.maxY) obj.posY = this.maxY;
		if(obj.mass %2 == 0) obj.mass += 1;
	},
	objMove: function(obj) {
		this.objFix(obj);
		if(!this.objIsFree(obj)) {
			for(var i = 0; i < this.cnst.fix.cnt; i++) {
				var fixX = Math.random() *this.cnst.fix.rndm;
				var fixY = Math.random() *this.cnst.fix.rndm;

				if(this.cnst.round) {
					fixX = Math.round(fixX);
					fixY = Math.round(fixY);
				}

				if(i %2 == 0) {
					obj.posX += fixX;
					obj.posY += fixY;
				} else {
					obj.posX -= fixX;
					obj.posY -= fixY;
				}

				this.objFix(obj);
				if(this.objIsFree(obj)) break;
				// else console.log("Error in #"+i, obj);
			}
		}

		obj.$.offset({
			top: this.offsetY +obj.posY -(obj.mass+1)/2,
			left: this.offsetX +obj.posX -(obj.mass+1)/2
		});
		obj.$.width(obj.mass);
		obj.$.height(obj.mass);
		// return null;
	},
	objIsFree: function(obj) {
		for(var c = 0; c < this.list.length; c++) {
			if(obj != this.list[c]) {
				var obj2 = this.list[c];
				if((!this.cnst.round
					&& obj.posX == obj2.posX
					&& obj.posY == obj2.posY
				) || (this.cnst.round
					&& Math.round(obj.posX) == Math.round(obj2.posX)
					&& Math.round(obj.posY) == Math.round(obj2.posY)
				)) return  false;
			}
		}
		return true;
	},
	objGetForce: function(obj) {
		var force = {X: 0, Y: 0};
		for(var c = 0; c < this.list.length; c++) {
			if(obj != this.list[c]) {
				var obj2 = this.list[c];
				// G * mass / (R *2 *Math.PI) => C = G / (2 *Math.PI)
				var forceX = this.cnst.C * obj2.mass / (obj.posX - obj2.posX);
				var forceY = this.cnst.C * obj2.mass / (obj.posY - obj2.posY);
				if(forceX != Infinity) force.X += forceX; else forceX = 0;
				if(forceY != Infinity) force.Y += forceY; else forceY = 0;
			}
		}
		return force;
	}
};

(function($) {
	$(document).ready(function() {
		space.$ = $('#space');
		$('#correct-1').click(function() {
			space.cnst.C = parseInt($('#gravity').val());
			space.obj_proto.mass = parseInt($('#mass2').val());
			space.cnst.speed = parseInt($('#speed').val());
			space.cnst.round = $('#round').attr('checked');
			space.cnst.fix.cnt = parseInt($('#fix_cnt').val());
			space.cnst.fix.rndm = parseInt($('#fix_rndm').val());
		});
		space.$.on('click', '.object-point', function() {
			var obj_id = this.id.replace(/object-/g, '');
			space.list[obj_id].$.toggleClass('mark');
		});
		space.$.on('dblclick', '.object-point', function() {
			var obj_id = this.id.replace(/object-/g, '');
			$('.object-point').removeClass('active', false);
			$('#correct-2').data('obj-id', null);
			$('#obj-id').val(obj_id);
			$('#correct-2').click();
		});
		$('#correct-2').click(function() {
			var obj_id = $('#obj-id').val();
			if(obj_id == null || obj_id === ''
				|| space.list[obj_id] == null) return;

			if($('#correct-2').data('obj-id') == null) {
				$('#obj-id').attr('disabled', true);
				$('#correct-2').data('obj-id', obj_id);
				space.list[obj_id].$.addClass('active', true);

				$('#posX').val(space.list[obj_id].posX);
				$('#posY').val(space.list[obj_id].posY);
				if(space.motionId == null) {
					$('#posX').attr('disabled', false);
					$('#posY').attr('disabled', false);
				}

				$('#mass').val(space.list[obj_id].mass);
				$('#mass').attr('disabled', false);
				$('#forceX').val(space.list[obj_id].force.X);
				$('#forceY').val(space.list[obj_id].force.Y);
			} else {
				$('#obj-id').attr('disabled', false);
				$('#correct-2').data('obj-id', null);
				space.list[obj_id].$.removeClass('active', false);

				if(space.motionId == null) {
					space.list[obj_id].posX = parseFloat($('#posX').val());
					space.list[obj_id].posY = parseFloat($('#posY').val());
				}
				$('#posX').attr('disabled', true);
				$('#posY').attr('disabled', true);

				if($('#mass').val() != space.obj_proto.mass)
					space.list[obj_id].mass = parseInt($('#mass').val());
				else delete space.list[obj_id].mass;
				$('#mass').attr('disabled', true);
				space.objMove(space.list[obj_id]);
			}
		});
		

		$('#reset').click(function() {
			var cnt = parseInt($('#objs').val())
			clearInterval(space.motionId);
			space.init().fill(cnt);
			space.motionId = null;
			$('.object-point').draggable({
				stop: function(event, ui) {
					var obj_id = this.id.replace(/object-/g, '');
					space.list[obj_id].posX -= ui.originalPosition.left - ui.position.left;
					space.list[obj_id].posY -= ui.originalPosition.top - ui.position.top;
					space.objMove(space.list[obj_id]);
				}
			});
		});
		$('#stop').click(function() {
			clearInterval(space.motionId);
			space.motionId = null;
		});
		$('#run').click(function() {
			space.motionId = setInterval(function() {
				space.motion();
			}, 500);
		});

		$('#correct-1').click();
	});
})(jQuery)
