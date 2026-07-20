// Comprehensive Twemoji data organized by category
// Based on Unicode 15.0 emoji list

export interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
}

// Common emoji shortcodes for search (:skull: → 💀, etc.)
// Maps shortcode names to emoji characters for keyword-based search.
export const EMOJI_NAMES: Record<string, string> = {
  // Smileys & Emotion
  'grinning': '😀', 'smiley': '😃', 'smile': '😄', 'grin': '😁', 'laughing': '😆',
  'sweat_smile': '😅', 'rofl': '🤣', 'joy': '😂', 'slight_smile': '🙂', 'upside_down': '🙃',
  'wink': '😉', 'blush': '😊', 'innocent': '😇', 'heart_eyes': '🥰', 'smiling_heart': '😍',
  'star_struck': '🤩', 'kissing_heart': '😘', 'kissing': '😗', 'relaxed': '☺️',
  'kissing_closed_eyes': '😚', 'kissing_smiling_eyes': '😙', 'smiling_tear': '🥲',
  'yum': '😋', 'stuck_out_tongue': '😛', 'stuck_out_tongue_winking_eye': '😜',
  'zany': '🤪', 'stuck_out_tongue_closed_eyes': '😝', 'money_mouth': '🤑',
  'hugs': '🤗', 'hand_over_mouth': '🤭', 'shushing': '🫢', 'peeking': '🫣',
  'shh': '🤫', 'thinking': '🤔', 'salute': '🫡',
  'zipper_mouth': '🤐', 'raised_eyebrow': '🤨', 'neutral': '😐', 'expressionless': '😑',
  'no_mouth': '😶', 'dotted_line_face': '🫥', 'shifty': '😏', 'unamused': '😒',
  'roll_eyes': '🙄', 'grimacing': '😬', 'sigh': '😮‍💨', 'lying': '🤥', 'shaking': '🫨',
  'relieved': '😌', 'pensive': '😔', 'sleepy': '😪', 'drool': '🤤', 'sleeping': '😴',
  'mask': '😷', 'thermometer_face': '🤒', 'bandage': '🤕', 'nauseated': '🤢', 'vomit': '🤮',
  'sneeze': '🤧', 'hot': '🥵', 'cold': '🥶', 'woozy': '🥴', 'dizzy': '😵', 'spiral_eyes': '😵‍💫',
  'exploding_head': '🤯', 'cowboy': '🤠', 'partying': '🥳', 'disguise': '🥸',
  'sunglasses': '😎', 'nerd': '🤓', 'monocle': '🧐',
  'confused': '😕', 'worried': '😟', 'frown': '🙁', 'slight_frown': '☹️',
  'open_mouth': '😮', 'hushed': '😯', 'astonished': '😲', 'flushed': '😳',
  'pleading': '🥺', 'tear_joy': '🥹', 'frowning': '😦', 'anguished': '😧',
  'fearful': '😨', 'anxious': '😰', 'sad': '😥', 'cry': '😢', 'sob': '😭',
  'scream': '😱', 'confounded': '😖', 'persevere': '😣', 'disappointed': '😞',
  'sweat': '😓', 'weary': '😩', 'tired': '😫', 'yawn': '🥱',
  'triumph': '😤', 'rage': '😡', 'angry': '😠', 'cuss': '🤬', 'smiling_imp': '😈', 'imp': '👿',
  'skull': '💀', 'skull_crossbones': '☠️',
  'poop': '💩', 'clown': '🤡', 'ogre': '👹', 'goblin': '👺', 'ghost': '👻',
  'alien': '👽', 'space_invader': '👾', 'robot': '🤖',
  'smiley_cat': '😺', 'smile_cat': '😸', 'joy_cat': '😹', 'heart_eyes_cat': '😻',
  'smirk_cat': '😼', 'kissing_cat': '😽', 'scream_cat': '🙀', 'crying_cat': '😿', 'pouting_cat': '😾',
  'see_no_evil': '🙈', 'hear_no_evil': '🙉', 'speak_no_evil': '🙊',
  'heart': '❤️', 'orange_heart': '🧡', 'yellow_heart': '💛', 'green_heart': '💚',
  'blue_heart': '💙', 'purple_heart': '💜', 'black_heart': '🖤', 'white_heart': '🤍',
  'brown_heart': '🤎', 'heart_fire': '❤️‍🔥', 'heart_bandage': '❤️‍🩹', 'broken_heart': '💔',
  'heart_exclamation': '❣️', 'two_hearts': '💕', 'revolving_hearts': '💞', 'heartbeat': '💓',
  'heartpulse': '💗', 'sparkling_heart': '💖', 'cupid': '💘', 'gift_heart': '💝', 'heart_decoration': '💟',
  'hearts_suit': '♥️', 'kiss_mark': '💋', 'hundred': '💯', 'anger': '💢', 'boom': '💥', 'dizzy_star': '💫',
  'sweat_drops': '💦', 'dash': '💨', 'hole': '🕳️', 'speech_balloon': '💬', 'eye_speech': '👁️‍🗨️',
  'speech_left': '🗨️', 'anger_bubble': '🗯️', 'thought': '💭', 'zzz': '💤', 'bubbles': '🫧',

  // People & Body
  'wave': '👋', 'raised_hand': '✋', 'stop': '✋', 'vulcan': '🖖', 'ok_hand': '👌',
  'pinched': '🤏', 'peace': '✌️', 'crossed_fingers': '🤞', 'love_you': '🤟',
  'metal': '🤘', 'call_me': '🤙', 'point_left': '👈', 'point_right': '👉', 'point_up': '👆',
  'fu': '🖕', 'point_down': '👇', 'raised_back_of_hand': '🤚',
  'hand_splayed': '🖐️', 'fist': '✊', 'punch': '👊', 'fist_right': '🤛',
  'left_facing_fist': '🤛', 'right_facing_fist': '🤜', 'thumbsup': '👍', 'thumbsdown': '👎',
  'clap': '👏', 'raised_hands': '🙌', 'open_hands': '👐', 'palms_up': '🤲',
  'handshake': '🤝', 'pray': '🙏', 'writing': '✍️', 'nail_care': '💅', 'selfie': '🤳',
  'muscle': '💪', 'mechanical_arm': '🦾', 'mechanical_leg': '🦿', 'leg': '🦵', 'foot': '🦶',
  'ear': '👂', 'nose': '👃', 'brain': '🧠', 'tooth': '🦷', 'bone': '🦴',
  'eyes': '👀', 'eye': '👁️', 'tongue': '👅', 'lips': '👄',
  'baby': '👶', 'child': '🧒', 'boy': '👦', 'girl': '👧', 'person': '🧑',
  'person_blond_hair': '👱', 'man': '👨', 'woman': '👩', 'older_person': '🧓',
  'old_man': '👴', 'old_woman': '👵',

  // Animals & Nature
  'dog': '🐶', 'cat': '🐱', 'mouse': '🐭', 'hamster': '🐹', 'rabbit': '🐰',
  'fox': '🦊', 'bear': '🐻', 'panda': '🐼', 'polar_bear': '🐻‍❄️', 'koala': '🐨',
  'tiger': '🐯', 'lion': '🦁', 'cow': '🐮', 'pig': '🐷', 'frog': '🐸',
  'monkey': '🐵', 'chicken': '🐔', 'penguin': '🐧', 'bird': '🐦', 'baby_chick': '🐤',
  'duck': '🦆', 'eagle': '🦅', 'owl': '🦉', 'bat': '🦇', 'wolf': '🐺',
  'boar': '🐗', 'horse': '🐴', 'unicorn': '🦄', 'bee': '🐝', 'bug': '🐛',
  'butterfly': '🦋', 'snail': '🐌', 'beetle': '🐞', 'ant': '🐜', 'spider': '🕷️',
  'scorpion': '🦂', 'turtle': '🐢', 'snake': '🐍', 'lizard': '🦎', 't_rex': '🦖',
  'sauropod': '🦕', 'octopus': '🐙', 'squid': '🦑', 'shrimp': '🦐', 'lobster': '🦞',
  'crab': '🦀', 'fish': '🐟', 'tropical_fish': '🐠', 'blowfish': '🐡', 'dolphin': '🐬',
  'whale': '🐳', 'whale2': '🐋', 'crocodile': '🐊', 'leopard': '🐆', 'tiger2': '🐅',
  'water_buffalo': '🐃', 'ox': '🐂', 'cow2': '🐄', 'deer': '🦌', 'camel': '🐪',
  'llama': '🦙', 'giraffe': '🦒', 'elephant': '🐘', 'rhinoceros': '🦏', 'hippopotamus': '🦛',
  'mouse2': '🐁', 'rat': '🐀', 'cat2': '🐈', 'rabbit2': '🐇', 'chipmunk': '🐿️',
  'hedgehog': '🦔', 'paw_prints': '🐾', 'dragon': '🐉', 'dragon_face': '🐲',
  'cactus': '🌵', 'evergreen_tree': '🌲', 'deciduous_tree': '🌳',
  'palm_tree': '🌴', 'seedling': '🌱', 'herb': '🌿', 'shamrock': '☘️', 'four_leaf_clover': '🍀',
  'leaves': '🍃', 'fallen_leaf': '🍂', 'maple_leaf': '🍁',
  'blossom': '🌼', 'tulip': '🌷', 'rose': '🌹', 'wilted_rose': '🥀', 'hibiscus': '🌺',
  'cherry_blossom': '🌸', 'white_flower': '💮', 'lotus': '🪷',
  'sunflower': '🌻', 'mushroom': '🍄', 'shell': '🐚', 'rock': '🪨', 'wood': '🪵',

  // Food & Drink
  'apple': '🍎', 'green_apple': '🍏', 'pear': '🍐', 'tangerine': '🍊', 'lemon': '🍋',
  'banana': '🍌', 'watermelon': '🍉', 'grapes': '🍇', 'strawberry': '🍓', 'melon': '🍈',
  'cherries': '🍒', 'peach': '🍑', 'mango': '🥭', 'pineapple': '🍍', 'coconut': '🥥',
  'kiwi': '🥝', 'tomato': '🍅', 'eggplant': '🍆', 'avocado': '🥑', 'broccoli': '🥦',
  'lettuce': '🥬', 'potato': '🥔', 'carrot': '🥕', 'corn': '🌽', 'hot_pepper': '🌶️',
  'bell_pepper': '🫑', 'cucumber': '🥒', 'garlic': '🧄', 'onion': '🧅',
  'bread': '🍞', 'croissant': '🥐', 'baguette': '🥖', 'pretzel': '🥨', 'bagel': '🥯',
  'pancakes': '🥞', 'waffle': '🧇', 'cheese': '🧀', 'meat_on_bone': '🍖', 'poultry_leg': '🍗',
  'cut_of_meat': '🥩', 'bacon': '🥓', 'hamburger': '🍔', 'fries': '🍟', 'pizza': '🍕',
  'hotdog': '🌭', 'sandwich': '🥪', 'taco': '🌮', 'burrito': '🌯', 'tamale': '🫔',
  'salad': '🥗', 'shallow_pan_of_food': '🥘', 'fondue': '🫕', 'canned_food': '🥫',
  'spaghetti': '🍝', 'ramen': '🍜', 'stew': '🍲', 'curry': '🍛', 'sushi': '🍣',
  'bento': '🍱', 'fried_shrimp': '🍤', 'rice_ball': '🍙', 'rice': '🍚', 'rice_cracker': '🍘',
  'fish_cake': '🍥', 'fortune_cookie': '🥠', 'moon_cake': '🥮', 'oden': '🍢', 'dango': '🍡',
  'shaved_ice': '🍧', 'ice_cream': '🍨', 'icecream': '🍦', 'pie': '🥧', 'cake': '🍰',
  'cupcake': '🧁', 'custard': '🍮', 'chocolate_bar': '🍫', 'candy': '🍬',
  'lollipop': '🍭', 'honey': '🍯', 'milk': '🥛', 'baby_bottle': '🍼',
  'coffee': '☕', 'tea': '🍵', 'mate': '🧉', 'sake': '🍶', 'champagne': '🍾',
  'wine': '🍷', 'cocktail': '🍸', 'tropical_drink': '🍹', 'beer': '🍺', 'beers': '🍻',
  'clinking_glasses': '🥂', 'tumbler_glass': '🥃', 'pouring_liquid': '🫗', 'cup_straw': '🥤',
  'bubble_tea': '🧋', 'beverage_box': '🧃', 'ice': '🧊',
  'salt': '🧂', 'spoon': '🥄', 'fork_and_knife': '🍴', 'fork_knife_plate': '🍽️',
  'bowl_with_spoon': '🥣', 'takeout_box': '🥡', 'chopsticks': '🥢',

  // Activities
  'soccer': '⚽', 'basketball': '🏀', 'football': '🏈', 'baseball': '⚾', 'softball': '🥎',
  'tennis': '🎾', 'volleyball': '🏐', 'rugby_football': '🏉', 'flying_disc': '🥏',
  '8ball': '🎱', 'golf': '⛳', 'golfing': '🏌️', 'ping_pong': '🏓', 'badminton': '🏸',
  'hockey_goal': '🥅', 'field_hockey': '🏑', 'ice_hockey': '🏒', 'cricket': '🏏', 'lacrosse': '🥍',
  'bowling': '🎳', 'boxing_glove': '🥊', 'martial_arts_uniform': '🥋',
  'skateboard': '🛹', 'roller_skate': '🛼', 'sled': '🛷',
  'ice_skate': '⛸️', 'ski': '🎿', 'snowboarder': '🏂', 'person_surfing': '🏄',
  'person_rowing_boat': '🚣', 'person_swimming': '🏊', 'person_bouncing_ball': '⛹️',
  'person_lifting_weights': '🏋️', 'person_fencing': '🤺',
  'person_playing_water_polo': '🤽', 'person_playing_handball': '🤾', 'person_juggling': '🤹',
  'cartwheel': '🤸', 'wrestling': '🤼', 'climbing': '🧗',
  'trophy': '🏆', 'first_place': '🥇', 'second_place': '🥈', 'third_place': '🥉',
  'medal': '🏅', 'military_medal': '🎖️', 'rosette': '🏵️', 'ribbon': '🎀',
  'ticket': '🎫', 'tickets': '🎟️',
  'circus_tent': '🎪', 'performing_arts': '🎭', 'art': '🎨',
  'clapper': '🎬', 'microphone': '🎤', 'headphones': '🎧', 'musical_score': '🎼',
  'musical_keyboard': '🎹', 'drum': '🥁', 'saxophone': '🎷', 'trumpet': '🎺',
  'guitar': '🎸', 'violin': '🎻', 'banjo': '🪕', 'accordion': '🪗', 'flute': '🪈',
  'game_die': '🎲', 'chess_pawn': '♟️', 'dart': '🎯',
  'video_game': '🎮', 'joystick': '🕹️', 'slot_machine': '🎰', 'jigsaw': '🧩',
  'spades': '♠️', 'diamonds': '♦️', 'clubs': '♣️',

  // Travel & Places
  'car': '🚗', 'taxi': '🚕', 'blue_car': '🚙', 'bus': '🚌', 'trolleybus': '🚎',
  'racing_car': '🏎️', 'police_car': '🚓', 'ambulance': '🚑', 'fire_engine': '🚒',
  'minibus': '🚐', 'truck': '🚚', 'articulated_lorry': '🚛', 'tractor': '🚜',
  'scooter': '🛵', 'bike': '🚲', 'motorcycle': '🏍️', 'rotating_light': '🚨',
  'traffic_light': '🚥', 'vertical_traffic_light': '🚦', 'stop_sign': '🛑',
  'construction': '🚧', 'railway_track': '🛤️', 'fuelpump': '⛽', 'bus_stop': '🚏',
  'rocket': '🚀', 'flying_saucer': '🛸', 'helicopter': '🚁', 'small_airplane': '🛩️',
  'airplane': '✈️', 'flight_departure': '🛫', 'flight_arrival': '🛬', 'seat': '💺',
  'canoe': '🛶', 'boat': '⛵', 'motor_boat': '🛥️', 'passenger_ship': '🛳️',
  'ferry': '⛴️', 'ship': '🚢', 'anchor': '⚓', 'ring_buoy': '🛟',
  'mountain': '⛰️', 'snow_capped_mountain': '🏔️', 'volcano': '🌋',
  'camping': '🏕️', 'beach': '🏖️', 'desert': '🏜️', 'island': '🏝️', 'park': '🏞️',
  'stadium': '🏟️', 'classical_building': '🏛️', 'building': '🏢', 'cityscape': '🏙️',
  'derelict_house': '🏚️', 'house': '🏠', 'house_with_garden': '🏡', 'homes': '🏘️',
  'construction_site': '🏗️', 'factory': '🏭', 'office': '🏢',
  'department_store': '🏬', 'japanese_post_office': '🏣',
  'european_post_office': '🏤', 'hospital': '🏥', 'bank': '🏦', 'hotel': '🏨',
  'convenience_store': '🏪', 'school': '🏫', 'love_hotel': '🏩', 'wedding': '💒',
  'european_castle': '🏰', 'japanese_castle': '🏯',
  'statue_of_liberty': '🗽', 'fountain': '⛲', 'tokyo_tower': '🗼',
  'church': '⛪', 'mosque': '🕌', 'synagogue': '🕍', 'hindu_temple': '🛕', 'kaaba': '🕋',
  'shinto_shrine': '⛩️', 'railway_station': '🚉', 'mountain_railway': '🚞',
  'train': '🚆', 'light_rail': '🚈', 'monorail': '🚝', 'bullettrain_side': '🚄',
  'bullettrain_front': '🚅', 'steam_locomotive': '🚂', 'train2': '🚃', 'metro': '🚇',
  'tram': '🚊',
  'earth_africa': '🌍', 'earth_americas': '🌎', 'earth_asia': '🌏', 'globe': '🌐',
  'map': '🗺️', 'compass': '🧭', 'pin': '📍', 'round_pushpin': '📍',
  'flag': '🚩', 'checkered_flag': '🏁', 'crossed_flags': '🎌',
  'rainbow_flag': '🏳️‍🌈', 'transgender_flag': '🏳️‍⚧️', 'pirate_flag': '🏴‍☠️',
  'white_flag': '🏳️', 'black_flag': '🏴',

  // Objects
  'eyeglasses': '👓', 'dark_sunglasses': '🕶️', 'goggles': '🥽', 'lab_coat': '🥼',
  'safety_vest': '🦺', 'necktie': '👔', 'shirt': '👕', 'jeans': '👖', 'scarf': '🧣',
  'gloves': '🧤', 'coat': '🧥', 'socks': '🧦', 'dress': '👗', 'kimono': '👘',
  'sari': '🥻', 'one_piece': '🩱', 'briefs': '🩲', 'shorts': '🩳',
  'bikini': '👙', 'womans_clothes': '👚', 'purse': '👛', 'handbag': '👜', 'clutch_bag': '👝',
  'shopping_bags': '🛍️', 'school_satchel': '🎒', 'thong_sandal': '🩴', 'shoe': '👞',
  'running_shoe': '👟', 'hiking_boot': '🥾', 'womans_boot': '👢', 'crown': '👑',
  'womans_hat': '👒', 'tophat': '🎩', 'mortar_board': '🎓', 'billed_cap': '🧢',
  'military_helmet': '🪖', 'rescue_worker_helmet': '⛑️', 'prayer_beads': '📿',
  'lipstick': '💄', 'ring_jewelry': '💍', 'gem': '💎', 'mute': '🔇', 'speaker': '🔈',
  'sound': '🔊', 'loud_sound': '📢', 'loudspeaker': '📣',
  'bell': '🔔', 'no_bell': '🔕', 'bellhop_bell': '🛎️',
  'clock': '⏰', 'alarm_clock': '⏰', 'stopwatch': '⏱️', 'timer': '⏲️',
  'hourglass': '⌛', 'hourglass_flowing_sand': '⏳', 'watch': '⌚',
  'phone': '📱', 'calling': '📲', 'telephone': '☎️', 'telephone_receiver': '📞',
  'pager': '📟', 'fax': '📠', 'battery': '🔋', 'electric_plug': '🔌', 'computer': '💻',
  'desktop': '🖥️', 'printer': '🖨️', 'keyboard': '⌨️', 'mouse_three_button': '🖱️',
  'trackball': '🖲️', 'minidisc': '💽', 'floppy_disk': '💾', 'cd': '💿', 'dvd': '📀',
  'abacus': '🧮', 'movie_camera': '🎥', 'video_camera': '📹', 'vhs': '📼',
  'camera': '📷', 'camera_with_flash': '📸', 'projector': '📽️',
  'film_frames': '🎞️',
  'candle': '🕯️', 'bulb': '💡', 'flashlight': '🔦', 'izakaya_lantern': '🏮',
  'diya_lamp': '🪔',
  'notebook': '📓', 'notebook_with_decorative_cover': '📔', 'ledger': '📒',
  'closed_book': '📕', 'green_book': '📗', 'blue_book': '📘', 'orange_book': '📙',
  'books': '📚', 'open_book': '📖', 'book': '📖', 'bookmark': '🔖', 'label': '🏷️',
  'moneybag': '💰', 'yen': '💴', 'dollar': '💵', 'euro': '💶', 'pound': '💷',
  'money_with_wings': '💸', 'credit_card': '💳', 'chart': '💹', 'currency_exchange': '💱',
  'heavy_dollar_sign': '💲', 'envelope': '✉️', 'email': '📧', 'incoming_envelope': '📨',
  'envelope_with_arrow': '📩', 'outbox_tray': '📤', 'inbox_tray': '📥', 'package': '📦',
  'postal_horn': '📯', 'mailbox': '📫', 'mailbox_closed': '📪', 'mailbox_with_mail': '📬',
  'mailbox_with_no_mail': '📭', 'postbox': '📮', 'ballot_box': '🗳️',
  'pencil2': '✏️', 'black_nib': '✒️', 'fountain_pen': '🖋️',
  'pen': '🖊️', 'paintbrush': '🖌️', 'crayon': '🖍️', 'memo': '📝', 'briefcase': '💼',
  'file_folder': '📁', 'open_file_folder': '📂', 'card_index': '🗂️', 'card_box': '🗃️',
  'wastebasket': '🗑️', 'spiral_calendar': '🗓️',
  'calendar': '📅', 'date': '📅', 'spiral_notepad': '🗒️',
  'clipboard': '📋', 'pushpin': '📌', 'paperclip': '📎',
  'linked_paperclips': '🖇️', 'straight_ruler': '📏', 'triangular_ruler': '📐',
  'scissors': '✂️', 'file_cabinet': '🗄️',
  'lock': '🔒', 'unlock': '🔓', 'lock_with_ink_pen': '🔏', 'closed_lock_with_key': '🔐',
  'key': '🔑', 'old_key': '🗝️', 'hammer': '🔨', 'pick': '⛏️', 'hammer_and_pick': '⚒️',
  'hammer_and_wrench': '🛠️', 'dagger': '🗡️', 'crossed_swords': '⚔️', 'gun': '🔫',
  'bow_and_arrow': '🏹', 'shield': '🛡️', 'wrench': '🔧', 'nut_and_bolt': '🔩',
  'gear': '⚙️', 'clamp': '🗜️', 'balance_scale': '⚖️', 'probing_cane': '🦯',
  'link': '🔗', 'chains': '⛓️', 'toolbox': '🧰', 'magnet': '🧲',
  'axe': '🪓', 'carpentry_saw': '🪚', 'screwdriver': '🪛', 'ladder': '🪜',
  'hook': '🪝', 'brick': '🧱', 'construction_worker': '👷',
  'firecracker': '🧨', 'sparkler': '🎇', 'fireworks': '🎆', 'sparkle': '✨',
  'balloon': '🎈', 'party_popper': '🎉', 'confetti_ball': '🎊',
  'tanabata_tree': '🎋', 'bamboo': '🎍', 'dolls': '🎎', 'flags': '🎏', 'wind_chime': '🎐',
  'rice_scene': '🎑', 'ribbon_gift': '🎀', 'gift': '🎁', 'red_envelope': '🧧',
  'teddy_bear': '🧸', 'pinata': '🪅', 'nesting_dolls': '🪆',
  'mirror': '🪞', 'window': '🪟', 'plunger': '🪠', 'sewing_needle': '🪡',
  'knot': '🪢', 'bucket': '🪣', 'mouse_trap': '🪤', 'broom': '🧹', 'basket': '🧺',
  'roll_of_paper': '🧻', 'potable_water': '🚰', 'shower': '🚿', 'bathtub': '🛁',
  'toilet': '🚽', 'soap': '🧼', 'sponge': '🧽', 'lotion_bottle': '🧴',
  'thread': '🧵', 'yarn': '🧶',

  // Symbols
  'peace_symbol': '☮️', 'cross_religious': '✝️',
  'star_and_crescent': '☪️', 'om_symbol': '🕉️', 'wheel_of_dharma': '☸️',
  'star_of_david': '✡️', 'six_pointed_star': '🔯', 'menorah': '🕎', 'yin_yang': '☯️',
  'orthodox_cross': '☦️', 'place_of_worship': '🛐', 'ophiuchus': '⛎', 'aries': '♈',
  'taurus': '♉', 'gemini': '♊', 'cancer': '♋', 'leo': '♌', 'virgo': '♍',
  'libra': '♎', 'scorpius': '♏', 'sagittarius': '♐', 'capricorn': '♑', 'aquarius': '♒',
  'pisces': '♓', 'id_button': '🆔', 'atom': '⚛️', 'accept': '🉑', 'radioactive': '☢️',
  'biohazard': '☣️', 'mobile_phone_off': '📴', 'vibration_mode': '📳',
  'restroom': '🚻', 'mens': '🚹', 'womens': '🚺', 'baby_symbol': '🚼',
  'wc': '🚾', 'passport_control': '🛂', 'customs': '🛃', 'baggage_claim': '🛄',
  'left_luggage': '🛅', 'warning': '⚠️', 'children_crossing': '🚸', 'no_entry': '⛔',
  'no_bicycles': '🚳', 'no_smoking': '🚭', 'do_not_litter': '🚯', 'non_potable_water': '🚱',
  'no_pedestrians': '🚷', 'no_mobile_phones': '📵', 'underage': '🔞',
  'no_entry_sign': '🚫',
  'x': '❌', 'o': '⭕',
  'cross_mark': '❌', 'heavy_check_mark': '✔️', 'ballot_box_with_check': '☑️',
  'radio_button': '🔘', 'white_check_mark': '✅', 'check_mark': '✔️', 'curly_loop': '➰',
  'loop': '➿', 'part_alternation_mark': '〽️', 'eight_spoked_asterisk': '✳️',
  'eight_pointed_black_star': '✴️', 'sparkle_symbol': '❇️', 'bangbang': '‼️', 'interrobang': '⁉️',
  'question': '❓', 'grey_question': '❔', 'grey_exclamation': '❕', 'exclamation': '❗',
  'wavy_dash': '〰️', 'copyright': '©️', 'registered': '®️', 'tm': '™️',
  'end_arrow': '🔚', 'back_arrow': '🔙', 'on_arrow': '🔛', 'top_arrow': '🔝', 'soon_arrow': '�',
  'arrows_clockwise': '🔄', 'restart': '🔄',
  'heavy_plus_sign': '➕', 'heavy_minus_sign': '➖', 'heavy_division_sign': '➗',
  'heavy_multiplication_x': '✖️', 'infinity': '♾️',
  'hash': '#️⃣', 'asterisk_key': '*️⃣', 'keycap_0': '0️⃣', 'keycap_1': '1️⃣', 'keycap_2': '2️⃣',
  'keycap_3': '3️⃣', 'keycap_4': '4️⃣', 'keycap_5': '5️⃣', 'keycap_6': '6️⃣',
  'keycap_7': '7️⃣', 'keycap_8': '8️⃣', 'keycap_9': '9️⃣', 'keycap_10': '🔟',
  'input_numbers': '🔢', 'input_latin_lowercase': '🔡', 'input_latin_uppercase': '🔠',
  'input_latin_letters': '🔤', 'input_symbols': '🔣',
  '1234': '🔢', 'abc': '🔤', 'a_button': '🅰️', 'b_button': '🅱️', 'ab_button': '🆎',
  'cl_button': '🆑', 'cool_button': '🆒', 'free_button': '🆓', 'new_button': '🆕', 'ng_button': '🆖',
  'ok_button': '🆗', 'sos_button': '🆘', 'up_button': '🆙', 'vs_button': '�',
  'congratulations': '㊗️', 'secret': '㊙️', 'm_button': 'Ⓜ️',
  'black_circle': '⚫', 'white_circle': '⚪', 'red_circle': '🔴', 'large_blue_circle': '🔵',
  'large_orange_diamond': '🔶', 'large_blue_diamond': '🔷',
  'small_orange_diamond': '🔸', 'small_blue_diamond': '🔹',
  'red_triangle_pointed_up': '🔺', 'red_triangle_pointed_down': '🔻', 'diamond_with_a_dot': '💠',
  'black_square_button': '🔲', 'white_square_button': '🔳',
  'black_small_square': '▪️', 'white_small_square': '▫️', 'black_medium_small_square': '◾',
  'white_medium_small_square': '◽', 'black_medium_square': '◼️', 'white_medium_square': '◻️',
  'black_large_square': '⬛', 'white_large_square': '⬜',

  // Weather & Sky
  'new_moon': '🌑', 'waxing_crescent_moon': '🌒', 'first_quarter_moon': '🌓',
  'waxing_gibbous_moon': '🌔', 'full_moon': '🌕', 'waning_gibbous_moon': '🌖',
  'last_quarter_moon': '🌗', 'waning_crescent_moon': '🌘', 'crescent_moon': '🌙',
  'new_moon_face': '🌚', 'first_quarter_moon_face': '🌛', 'last_quarter_moon_face': '🌜',
  'thermometer_weather': '🌡️', 'sun': '☀️', 'full_moon_face': '🌝', 'sun_with_face': '🌞',
  'ringed_planet': '🪐', 'star': '⭐', 'glowing_star': '🌟', 'shooting_star': '🌠',
  'cloud': '☁️', 'cloud_with_lightning_and_rain': '⛈️', 'cloud_with_rain': '🌧️',
  'cloud_with_snow': '🌨️', 'cloud_with_lightning': '🌩️', 'tornado': '🌪️',
  'fog': '🌫️', 'wind_face': '🌬️', 'cyclone': '🌀', 'rainbow': '🌈', 'umbrella': '☂️',
  'umbrella_with_rain_drops': '☔', 'high_voltage': '⚡', 'snowflake': '❄️',
  'snowman': '⛄', 'snowman_without_snow': '☃️', 'comet': '☄️', 'fire': '🔥',
  'droplet': '💧', 'ocean': '🌊',

  // Events
  'christmas_tree': '🎄', 'jack_o_lantern': '🎃', 'tada': '🎉',
  'wrapped_gift': '🎁',
};

// Reverse map: emoji character → shortcode name
export const EMOJI_TO_NAME: Record<string, string> = Object.entries(EMOJI_NAMES).reduce(
  (acc, [name, char]) => { if (!(char in acc)) acc[char] = name; return acc; },
  {} as Record<string, string>
);

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'smileys',
    name: 'Smileys & Emotion',
    emojis: [
      // Face smiling
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇',
      // Face affection
      '🥰', '😍', '🤩', '😘', '😗', '☺️', '😚', '😙', '🥲',
      // Face tongue
      '😋', '😛', '😜', '🤪', '😝', '🤑',
      // Face hand
      '🤗', '🤭', '🫢', '🫣', '🤫', '🤔', '🫡',
      // Face neutral skeptical
      '🤐', '🤨', '😐', '😑', '😶', '🫥', '😶‍🌫️', '😏', '😒', '🙄', '😬', '😮‍💨', '🤥', '🫨',
      // Face sleepy
      '😌', '😔', '😪', '🤤', '😴',
      // Face unwell
      '😷', '🤒', '🤕', '🤢', '🤮', '🤧', '🥵', '🥶', '🥴', '😵', '😵‍💫', '🤯',
      // Face hat
      '🤠', '🥳', '🥸',
      // Face glasses
      '😎', '🤓', '🧐',
      // Face concerned
      '😕', '🫤', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '🥹', '😦', '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩', '😫', '🥱',
      // Face negative
      '😤', '😡', '😠', '🤬', '😈', '👿', '💀', '☠️',
      // Face costume
      '💩', '🤡', '👹', '👺', '👻', '👽', '👾', '🤖',
      // Cat face
      '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '😿', '😾',
      // Monkey face
      '🙈', '🙉', '🙊',
      // Heart
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '❤️‍🔥', '❤️‍🩹', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️',
      // Emotion
      '💋', '💯', '💢', '💥', '💫', '💦', '💨', '🕳️', '💬', '👁️‍🗨️', '🗨️', '🗯️', '💭', '💤', '🫧',
    ],
  },
  {
    id: 'people',
    name: 'People & Body',
    emojis: [
      // Hand fingers open
      '👋', '🤚', '🖐️', '✋', '🖖', '🫱', '🫲', '🫳', '🫴', '🫷', '🫸',
      // Hand fingers partial
      '👌', '🤌', '🤏', '✌️', '🤞', '🫰', '🤟', '🤘', '🤙',
      // Hand single finger
      '👈', '👉', '👆', '🖕', '👇', '☝️', '🫵',
      // Hand fingers closed
      '👍', '👎', '✊', '👊', '🤛', '🤜',
      // Hands
      '👏', '🙌', '🫶', '👐', '🤲', '🤝', '🙏',
      // Hand prop
      '✍️', '💅', '🤳',
      // Body parts
      '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🫀', '🫁', '🦷', '🦴', '👀', '👁️', '👅', '👄', '🫦',
      // Person
      '👶', '🧒', '👦', '👧', '🧑', '👱', '👨', '🧔', '🧔‍♂️', '🧔‍♀️', '👩', '🧓', '👴', '👵',
      // Person gesture
      '🙍', '🙍‍♂️', '🙍‍♀️', '🙎', '🙎‍♂️', '🙎‍♀️', '🙅', '🙅‍♂️', '🙅‍♀️', '🙆', '🙆‍♂️', '🙆‍♀️', '💁', '💁‍♂️', '💁‍♀️', '🙋', '🙋‍♂️', '🙋‍♀️', '🧏', '🧏‍♂️', '🧏‍♀️', '🙇', '🙇‍♂️', '🙇‍♀️', '🤦', '🤦‍♂️', '🤦‍♀️', '🤷', '🤷‍♂️', '🤷‍♀️',
      // Person role
      '👮', '👮‍♂️', '👮‍♀️', '🕵️', '🕵️‍♂️', '🕵️‍♀️', '💂', '💂‍♂️', '💂‍♀️', '🥷', '👷', '👷‍♂️', '👷‍♀️', '🫅', '🤴', '👸', '👳', '👳‍♂️', '👳‍♀️', '👲', '🧕', '🤵', '🤵‍♂️', '🤵‍♀️', '👰', '👰‍♂️', '👰‍♀️', '🤰', '🫃', '🫄', '🤱', '👼', '🎅', '🤶', '🦸', '🦸‍♂️', '🦸‍♀️', '🦹', '🦹‍♂️', '🦹‍♀️', '🧙', '🧙‍♂️', '🧙‍♀️', '🧚', '🧚‍♂️', '🧚‍♀️', '🧛', '🧛‍♂️', '🧛‍♀️', '🧜', '🧜‍♂️', '🧜‍♀️', '🧝', '🧝‍♂️', '🧝‍♀️', '🧞', '🧞‍♂️', '🧞‍♀️', '🧟', '🧟‍♂️', '🧟‍♀️', '🧌',
      // Person activity
      '💆', '💆‍♂️', '💆‍♀️', '💇', '💇‍♂️', '💇‍♀️', '🚶', '🚶‍♂️', '🚶‍♀️', '🧍', '🧍‍♂️', '🧍‍♀️', '🧎', '🧎‍♂️', '🧎‍♀️', '🏃', '🏃‍♂️', '🏃‍♀️', '💃', '🕺', '🕴️', '👯', '👯‍♂️', '👯‍♀️', '🧖', '🧖‍♂️', '🧖‍♀️',
      // Person sport
      '🧗', '🧗‍♂️', '🧗‍♀️', '🤺', '🏇', '⛷️', '🏂', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏄', '🏄‍♂️', '🏄‍♀️', '🚣', '🚣‍♂️', '🚣‍♀️', '🏊', '🏊‍♂️', '🏊‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🤸', '🤸‍♂️', '🤸‍♀️', '🤼', '🤼‍♂️', '🤼‍♀️', '🤽', '🤽‍♂️', '🤽‍♀️', '🤾', '🤾‍♂️', '🤾‍♀️', '🤹', '🤹‍♂️', '🤹‍♀️', '🧘', '🧘‍♂️', '🧘‍♀️',
      // Person resting
      '🛀', '🛌',
      // Family
      '👭', '👫', '👬', '💏', '💑', '👪', '👨‍👩‍👦', '👨‍👩‍👧', '👨‍👩‍👧‍👦', '👨‍👩‍👦‍👦', '👨‍👩‍👧‍👧', '👨‍👦', '👨‍👦‍👦', '👨‍👧', '👨‍👧‍👦', '👨‍👧‍👧', '👩‍👦', '👩‍👦‍👦', '👩‍👧', '👩‍👧‍👦', '👩‍👧‍👧',
      // Person symbol
      '🗣️', '👤', '👥', '🫂', '👣',
    ],
  },
  {
    id: 'animals',
    name: 'Animals & Nature',
    emojis: [
      // Animal mammal
      '🐵', '🐒', '🦍', '🦧', '🐶', '🐕', '🦮', '🐕‍🦺', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🐈‍⬛', '🦁', '🐯', '🐅', '🐆', '🐴', '🫎', '🫏', '🐎', '🦄', '🦓', '🦌', '🦬', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐽', '🐏', '🐑', '🐐', '🐪', '🐫', '🦙', '🦒', '🐘', '🦣', '🦏', '🦛', '🐭', '🐁', '🐀', '🐹', '🐰', '🐇', '🐿️', '🦫', '🦔', '🦇', '🐻', '🐻‍❄️', '🐨', '🐼', '🦥', '🦦', '🦨', '🦘', '🦡', '🐾',
      // Animal bird
      '🦃', '🐔', '🐓', '🐣', '🐤', '🐥', '🐦', '🐧', '🕊️', '🦅', '🦆', '🦢', '🦉', '🦤', '🪶', '🦩', '🦚', '🦜', '🪽', '🐦‍⬛', '🪿',
      // Animal amphibian
      '🐸',
      // Animal reptile
      '🐊', '🐢', '🦎', '🐍', '🐲', '🐉', '🦕', '🦖',
      // Animal marine
      '🐳', '🐋', '🐬', '🦭', '🐟', '🐠', '🐡', '🦈', '🐙', '🐚', '🪸', '🪼',
      // Animal bug
      '🐌', '🦋', '🐛', '🐜', '🐝', '🪲', '🐞', '🦗', '🪳', '🕷️', '🕸️', '🦂', '🦟', '🪰', '🪱', '🦠',
      // Plant flower
      '💐', '🌸', '💮', '🪷', '🏵️', '🌹', '🥀', '🌺', '🌻', '🌼', '🌷', '🪻',
      // Plant other
      '🌱', '🪴', '🌲', '🌳', '🌴', '🌵', '🌾', '🌿', '☘️', '🍀', '🍁', '🍂', '🍃', '🪹', '🪺', '🍄',
    ],
  },
  {
    id: 'food',
    name: 'Food & Drink',
    emojis: [
      // Food fruit
      '🍇', '🍈', '🍉', '🍊', '🍋', '🍌', '🍍', '🥭', '🍎', '🍏', '🍐', '🍑', '🍒', '🍓', '🫐', '🥝', '🍅', '🫒', '🥥',
      // Food vegetable
      '🥑', '🍆', '🥔', '🥕', '🌽', '🌶️', '🫑', '🥒', '🥬', '🥦', '🧄', '🧅', '🥜', '🫘', '🌰', '🫚', '🫛',
      // Food prepared
      '🍞', '🥐', '🥖', '🫓', '🥨', '🥯', '🥞', '🧇', '🧀', '🍖', '🍗', '🥩', '🥓', '🍔', '🍟', '🍕', '🌭', '🥪', '🌮', '🌯', '🫔', '🥙', '🧆', '🥚', '🍳', '🥘', '🍲', '🫕', '🥣', '🥗', '🍿', '🧈', '🧂', '🥫',
      // Food asian
      '🍱', '🍘', '🍙', '🍚', '🍛', '🍜', '🍝', '🍠', '🍢', '🍣', '🍤', '🍥', '🥮', '🍡', '🥟', '🥠', '🥡',
      // Food marine
      '🦀', '🦞', '🦐', '🦑', '🦪',
      // Food sweet
      '🍦', '🍧', '🍨', '🍩', '🍪', '🎂', '🍰', '🧁', '🥧', '🍫', '🍬', '🍭', '🍮', '🍯',
      // Drink
      '🍼', '🥛', '☕', '🫖', '🍵', '🍶', '🍾', '🍷', '🍸', '🍹', '🍺', '🍻', '🥂', '🥃', '🫗', '🥤', '🧋', '🧃', '🧉', '🧊',
      // Dishware
      '🥢', '🍽️', '🍴', '🥄', '🔪', '🫙', '🏺',
    ],
  },
  {
    id: 'activities',
    name: 'Activities',
    emojis: [
      // Event
      '🎃', '🎄', '🎆', '🎇', '🧨', '✨', '🎈', '🎉', '🎊', '🎋', '🎍', '🎎', '🎏', '🎐', '🎑', '🧧', '🎀', '🎁', '🎗️', '🎟️', '🎫',
      // Award medal
      '🎖️', '🏆', '🏅', '🥇', '🥈', '🥉',
      // Sport
      '⚽', '⚾', '🥎', '🏀', '🏐', '🏈', '🏉', '🎾', '🥏', '🎳', '🏏', '🏑', '🏒', '🥍', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌',
      // Game
      '🎯', '🪀', '🪁', '🔫', '🎱', '🔮', '🪄', '🎮', '🕹️', '🎰', '🎲', '🧩', '🧸', '🪅', '🪩', '🪆', '♠️', '♥️', '♦️', '♣️', '♟️', '🃏', '🀄', '🎴',
      // Arts crafts
      '🎭', '🖼️', '🎨', '🧵', '🪡', '🧶', '🪢',
    ],
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    emojis: [
      // Place map
      '🌍', '🌎', '🌏', '🌐', '🗺️', '🧭',
      // Place geographic
      '🏔️', '⛰️', '🌋', '🗻', '🏕️', '🏖️', '🏜️', '🏝️', '🏞️',
      // Place building
      '🏟️', '🏛️', '🏗️', '🧱', '🪨', '🪵', '🛖', '🏘️', '🏚️', '🏠', '🏡', '🏢', '🏣', '🏤', '🏥', '🏦', '🏨', '🏩', '🏪', '🏫', '🏬', '🏭', '🏯', '🏰', '💒', '🗼', '🗽',
      // Place religious
      '⛪', '🕌', '🛕', '🕍', '⛩️', '🕋',
      // Place other
      '⛲', '⛺', '🌁', '🌃', '🏙️', '🌄', '🌅', '🌆', '🌇', '🌉', '♨️', '🎠', '🛝', '🎡', '🎢', '💈', '🎪',
      // Transport ground
      '🚂', '🚃', '🚄', '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞', '🚋', '🚌', '🚍', '🚎', '🚐', '🚑', '🚒', '🚓', '🚔', '🚕', '🚖', '🚗', '🚘', '🚙', '🛻', '🚚', '🚛', '🚜', '🏎️', '🏍️', '🛵', '🦽', '🦼', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣️', '🛤️', '🛢️', '⛽', '🛞', '🚨', '🚥', '🚦', '🛑', '🚧',
      // Transport water
      '⚓', '🛟', '⛵', '🛶', '🚤', '🛳️', '⛴️', '🛥️', '🚢',
      // Transport air
      '✈️', '🛩️', '🛫', '🛬', '🪂', '💺', '🚁', '🚟', '🚠', '🚡', '🛰️', '🚀', '🛸',
      // Hotel
      '🛎️', '🧳',
      // Time
      '⌛', '⏳', '⌚', '⏰', '⏱️', '⏲️', '🕰️', '🕛', '🕧', '🕐', '🕜', '🕑', '🕝', '🕒', '🕞', '🕓', '🕟', '🕔', '🕠', '🕕', '🕡', '🕖', '🕢', '🕗', '🕣', '🕘', '🕤', '🕙', '🕥', '🕚', '🕦',
      // Sky weather
      '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘', '🌙', '🌚', '🌛', '🌜', '🌡️', '☀️', '🌝', '🌞', '🪐', '⭐', '🌟', '🌠', '🌌', '☁️', '⛅', '⛈️', '🌤️', '🌥️', '🌦️', '🌧️', '🌨️', '🌩️', '🌪️', '🌫️', '🌬️', '🌀', '🌈', '🌂', '☂️', '☔', '⛱️', '⚡', '❄️', '☃️', '⛄', '☄️', '🔥', '💧', '🌊', '🎇', '🎆', '🌋',
    ],
  },
  {
    id: 'objects',
    name: 'Objects',
    emojis: [
      // Clothing
      '👓', '🕶️', '🥽', '🥼', '🦺', '👔', '👕', '👖', '🧣', '🧤', '🧥', '🧦', '👗', '👘', '🥻', '🩱', '🩲', '🩳', '👙', '👚', '🪭', '👛', '👜', '👝', '🛍️', '🎒', '🩴', '👞', '👟', '🥾', '🥿', '👠', '👡', '🩰', '👢', '🪮', '👑', '👒', '🎩', '🎓', '🧢', '🪖', '⛑️', '📿', '💄', '💍', '💎',
      // Sound
      '🔇', '🔈', '🔉', '🔊', '📢', '📣', '📯', '🔔', '🔕',
      // Music
      '🎼', '🎵', '🎶', '🎙️', '🎚️', '🎛️', '🎤', '🎧', '📻',
      // Musical instrument
      '🎷', '🪗', '🎸', '🎹', '🎺', '🎻', '🪕', '🥁', '🪘', '🪇', '🪈',
      // Phone
      '📱', '📲', '☎️', '📞', '📟', '📠',
      // Computer
      '🔋', '🪫', '🔌', '💻', '🖥️', '🖨️', '⌨️', '🖱️', '🖲️', '💽', '💾', '💿', '📀', '🧮',
      // Light video
      '🎥', '🎞️', '📽️', '🎬', '📺', '📷', '📸', '📹', '📼', '🔍', '🔎', '🕯️', '💡', '🔦', '🏮', '🪔',
      // Book paper
      '📔', '📕', '📖', '📗', '📘', '📙', '📚', '📓', '📒', '📃', '📜', '📄', '📰', '🗞️', '📑', '🔖', '🏷️',
      // Money
      '💰', '🪙', '💴', '💵', '💶', '💷', '💸', '💳', '🧾', '💹',
      // Mail
      '✉️', '📧', '📨', '📩', '📤', '📥', '📦', '📫', '📪', '📬', '📭', '📮', '🗳️',
      // Writing
      '✏️', '✒️', '🖋️', '🖊️', '🖌️', '🖍️', '📝',
      // Office
      '💼', '📁', '📂', '🗂️', '📅', '📆', '🗒️', '🗓️', '📇', '📈', '📉', '📊', '📋', '📌', '📍', '📎', '🖇️', '📏', '📐', '✂️', '🗃️', '🗄️', '🗑️',
      // Lock
      '🔒', '🔓', '🔏', '🔐', '🔑', '🗝️',
      // Tool
      '🔨', '🪓', '⛏️', '⚒️', '🛠️', '🗡️', '⚔️', '💣', '🪃', '🏹', '🛡️', '🪚', '🔧', '🪛', '🔩', '⚙️', '🗜️', '⚖️', '🦯', '🔗', '⛓️', '🪝', '🧰', '🧲', '🪜',
      // Science
      '⚗️', '🧪', '🧫', '🧬', '🔬', '🔭', '📡',
      // Medical
      '💉', '🩸', '💊', '🩹', '🩼', '🩺', '🩻',
      // Household
      '🚪', '🛗', '🪞', '🪟', '🛏️', '🛋️', '🪑', '🚽', '🪠', '🚿', '🛁', '🪤', '🪒', '🧴', '🧷', '🧹', '🧺', '🧻', '🪣', '🧼', '🫧', '🪥', '🧽', '🧯', '🛒',
      // Other object
      '🚬', '⚰️', '🪦', '⚱️', '🏺', '🗿', '🪧', '🪪',
    ],
  },
  {
    id: 'symbols',
    name: 'Symbols',
    emojis: [
      // Transport sign
      '🏧', '🚮', '🚰', '♿', '🚹', '🚺', '🚻', '🚼', '🚾', '🛂', '🛃', '🛄', '🛅',
      // Warning
      '⚠️', '🚸', '⛔', '🚫', '🚳', '🚭', '🚯', '🚱', '🚷', '📵', '🔞', '☢️', '☣️',
      // Arrow
      '⬆️', '↗️', '➡️', '↘️', '⬇️', '↙️', '⬅️', '↖️', '↕️', '↔️', '↩️', '↪️', '⤴️', '⤵️', '🔃', '🔄', '🔙', '🔚', '🔛', '🔜', '🔝',
      // Religion
      '🛐', '⚛️', '🕉️', '✡️', '☸️', '☯️', '✝️', '☦️', '☪️', '☮️', '🕎', '🔯', '🪯',
      // Zodiac
      '♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓', '⛎',
      // Av symbol
      '🔀', '🔁', '🔂', '▶️', '⏩', '⏭️', '⏯️', '◀️', '⏪', '⏮️', '🔼', '⏫', '🔽', '⏬', '⏸️', '⏹️', '⏺️', '⏏️', '🎦', '🔅', '🔆', '📶', '🛜', '📳', '📴',
      // Gender
      '♀️', '♂️', '⚧️',
      // Math
      '✖️', '➕', '➖', '➗', '🟰', '♾️',
      // Punctuation
      '‼️', '⁉️', '❓', '❔', '❕', '❗', '〰️',
      // Currency
      '💱', '💲',
      // Other symbol
      '⚕️', '♻️', '⚜️', '🔱', '📛', '🔰', '⭕', '✅', '☑️', '✔️', '❌', '❎', '➰', '➿', '〽️', '✳️', '✴️', '❇️', '©️', '®️', '™️',
      // Keycap
      '#️⃣', '*️⃣', '0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟',
      // Alphanum
      '🔠', '🔡', '🔢', '🔣', '🔤', '🅰️', '🆎', '🅱️', '🆑', '🆒', '🆓', 'ℹ️', '🆔', 'Ⓜ️', '🆕', '🆖', '🅾️', '🆗', '🅿️', '🆘', '🆙', '🆚', '🈁', '🈂️', '🈷️', '🈶', '🈯', '🉐', '🈹', '🈚', '🈲', '🉑', '🈸', '🈴', '🈳', '㊗️', '㊙️', '🈺', '🈵',
      // Geometric
      '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫', '⬛', '⬜', '◼️', '◻️', '◾', '◽', '▪️', '▫️', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔳', '🔲',
    ],
  },
  {
    id: 'flags',
    name: 'Flags',
    emojis: [
      // Flag
      '🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️',
      // Country flag - Popular
      '🇺🇸', '🇬🇧', '🇨🇦', '🇦🇺', '🇯🇵', '🇰🇷', '🇨🇳', '🇮🇳', '🇩🇪', '🇫🇷', '🇮🇹', '🇪🇸', '🇧🇷', '🇲🇽', '🇷🇺',
      // Country flag - All
      '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲', '🇦🇴', '🇦🇶', '🇦🇷', '🇦🇸', '🇦🇹', '🇦🇼', '🇦🇽', '🇦🇿',
      '🇧🇦', '🇧🇧', '🇧🇩', '🇧🇪', '🇧🇫', '🇧🇬', '🇧🇭', '🇧🇮', '🇧🇯', '🇧🇱', '🇧🇲', '🇧🇳', '🇧🇴', '🇧🇶', '🇧🇸', '🇧🇹', '🇧🇻', '🇧🇼', '🇧🇾', '🇧🇿',
      '🇨🇨', '🇨🇩', '🇨🇫', '🇨🇬', '🇨🇭', '🇨🇮', '🇨🇰', '🇨🇱', '🇨🇲', '🇨🇴', '🇨🇵', '🇨🇷', '🇨🇺', '🇨🇻', '🇨🇼', '🇨🇽', '🇨🇾', '🇨🇿',
      '🇩🇬', '🇩🇯', '🇩🇰', '🇩🇲', '🇩🇴', '🇩🇿',
      '🇪🇦', '🇪🇨', '🇪🇪', '🇪🇬', '🇪🇭', '🇪🇷', '🇪🇹', '🇪🇺',
      '🇫🇮', '🇫🇯', '🇫🇰', '🇫🇲', '🇫🇴',
      '🇬🇦', '🇬🇩', '🇬🇪', '🇬🇫', '🇬🇬', '🇬🇭', '🇬🇮', '🇬🇱', '🇬🇲', '🇬🇳', '🇬🇵', '🇬🇶', '🇬🇷', '🇬🇸', '🇬🇹', '🇬🇺', '🇬🇼', '🇬🇾',
      '🇭🇰', '🇭🇲', '🇭🇳', '🇭🇷', '🇭🇹', '🇭🇺',
      '🇮🇨', '🇮🇩', '🇮🇪', '🇮🇱', '🇮🇲', '🇮🇴', '🇮🇶', '🇮🇷', '🇮🇸',
      '🇯🇪', '🇯🇲', '🇯🇴',
      '🇰🇪', '🇰🇬', '🇰🇭', '🇰🇮', '🇰🇲', '🇰🇳', '🇰🇵', '🇰🇼', '🇰🇾', '🇰🇿',
      '🇱🇦', '🇱🇧', '🇱🇨', '🇱🇮', '🇱🇰', '🇱🇷', '🇱🇸', '🇱🇹', '🇱🇺', '🇱🇻', '🇱🇾',
      '🇲🇦', '🇲🇨', '🇲🇩', '🇲🇪', '🇲🇫', '🇲🇬', '🇲🇭', '🇲🇰', '🇲🇱', '🇲🇲', '🇲🇳', '🇲🇴', '🇲🇵', '🇲🇶', '🇲🇷', '🇲🇸', '🇲🇹', '🇲🇺', '🇲🇻', '🇲🇼', '🇲🇾', '🇲🇿',
      '🇳🇦', '🇳🇨', '🇳🇪', '🇳🇫', '🇳🇬', '🇳🇮', '🇳🇱', '🇳🇴', '🇳🇵', '🇳🇷', '🇳🇺', '🇳🇿',
      '🇴🇲',
      '🇵🇦', '🇵🇪', '🇵🇫', '🇵🇬', '🇵🇭', '🇵🇰', '🇵🇱', '🇵🇲', '🇵🇳', '🇵🇷', '🇵🇸', '🇵🇹', '🇵🇼', '🇵🇾',
      '🇶🇦',
      '🇷🇪', '🇷🇴', '🇷🇸', '🇷🇼',
      '🇸🇦', '🇸🇧', '🇸🇨', '🇸🇩', '🇸🇪', '🇸🇬', '🇸🇭', '🇸🇮', '🇸🇯', '🇸🇰', '🇸🇱', '🇸🇲', '🇸🇳', '🇸🇴', '🇸🇷', '🇸🇸', '🇸🇹', '🇸🇻', '🇸🇽', '🇸🇾', '🇸🇿',
      '🇹🇦', '🇹🇨', '🇹🇩', '🇹🇫', '🇹🇬', '🇹🇭', '🇹🇯', '🇹🇰', '🇹🇱', '🇹🇲', '🇹🇳', '🇹🇴', '🇹🇷', '🇹🇹', '🇹🇻', '🇹🇼', '🇹🇿',
      '🇺🇦', '🇺🇬', '🇺🇲', '🇺🇳', '🇺🇾', '🇺🇿',
      '🇻🇦', '🇻🇨', '🇻🇪', '🇻🇬', '🇻🇮', '🇻🇳', '🇻🇺',
      '🇼🇫', '🇼🇸',
      '🇽🇰',
      '🇾🇪', '🇾🇹',
      '🇿🇦', '🇿🇲', '🇿🇼',
      // Subdivision flag
      '🏴󠁧󠁢󠁥󠁮󠁧󠁿', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
    ],
  },
];

// Get all emojis as a flat list
export function getAllEmojis(): string[] {
  return EMOJI_CATEGORIES.flatMap(cat => cat.emojis);
}

// Search emojis by shortcode name
export function searchEmojis(query: string): { category: EmojiCategory; emoji: string }[] {
  const results: { category: EmojiCategory; emoji: string }[] = [];
  const normalizedQuery = query.toLowerCase();
  
  for (const category of EMOJI_CATEGORIES) {
    for (const emoji of category.emojis) {
      const name = EMOJI_TO_NAME[emoji];
      if (name && name.includes(normalizedQuery)) {
        results.push({ category, emoji });
      }
    }
  }
  
  return results;
}

// Get emoji category by ID
export function getCategoryById(id: string): EmojiCategory | undefined {
  return EMOJI_CATEGORIES.find(cat => cat.id === id);
}
