// System of axes:
// 	X => left => width;
// 	Y => top => height;
var space = {
	offset: {X: 0, Y: 0},
	radius: 100, objects: [],
	obj_proto: {
		X: 0, Y: 0, M: 9
	},
	cnsts: {
		speed: 250,
		round: true,
		inertia: 100,
		G: 10, BH: 0,
		fix: {cnt: 7, rndm: 3}
	},
};

(function($) {
	$(document).ready(function() {
		space.$ = $('#space');
		space.$.on('click', '.object-point', function() {
			var obj = this.id.replace(/object-/g, '');
			space.list[obj].$.toggleClass('mark');
		});
		space.$.on('dblclick', '.object-point', function() {
			var obj = this.id.replace(/object-/g, '');
			$('.object-point').removeClass('active', false);
			$('#correct-2').data('obj-id', null);
			$('#obj-id').val(obj);
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
			var cnt = parseInt($('#obj-cnt').val())
			if(space.motionId != null)
				$('#play').click();

			// space.init().fill(cnt);
			$('.object-point').draggable({
				stop: function(event, ui) {
					var obj = this.id.replace(/object-/g, '');
					space.list[obj].posX -= ui.originalPosition.left - ui.position.left;
					space.list[obj].posY -= ui.originalPosition.top - ui.position.top;
					// space.objMove(space.list[obj]);
				}
			});
		});
		$('#play').click(function() {
			if(space.motionId == null) {
				$(this).val('Остановить');
				space.motionId = setInterval(function() {
					space.motion();
				}, 500);
			} else {
				$(this).val('Запустить');
				clearInterval(space.motionId);
				space.motionId = null;
			}
		});

		$('#correct-1').click();
	});
})(jQuery)
