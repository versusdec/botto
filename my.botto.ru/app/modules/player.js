define(['microcore', 'mst!layouts/components/player', 'app/filters/time', 'recorder'], function (mc, player_view, timeFilter, Recorder) {
    async function analyze(file, player) {
        player.find('.loading').removeClass('hide')
        let context = new (window.AudioContext || window.webkitAudioContext)();
        let arrayBuffer;
        const headers = new Headers();
        // headers.append('pragma', 'no-cache');
        headers.append('cache-control', 'no-cache');
        let init = {
            method: "GET",
            headers: headers
        }
        const req = new Request(file)
        try {
            arrayBuffer = await fetch(file, init).then(response => response.arrayBuffer());
        } catch (e) {
            player.find('.loading').html(mc.i18n('system.error')).css('background-size', 0)
        }
        if (!arrayBuffer) {
            return;
        }

        return new Promise(function (resolve, reject) {
            context.decodeAudioData(arrayBuffer, (audioBuffer) => {
                const rawData = audioBuffer.getChannelData(0);
                if (audioBuffer.numberOfChannels == 2) {
                    audioBuffer.getChannelData(1).map((value, index) => {
                        rawData[index] += value
                    })
                }

                const samples = 100;
                const blockSize = Math.floor(rawData.length / samples);
                let filteredData = [];
                for (let i = 0; i < samples; i++) {
                    let blockStart = blockSize * i;
                    let sum = 0;
                    for (let j = 0; j < blockSize; j++) {
                        sum = sum + Math.abs(rawData[blockStart + j])
                    }
                    filteredData.push(sum / blockSize);
                }

                const multiplier = Math.pow(Math.max(...filteredData), -1);
                filteredData = filteredData.map(n => n * multiplier);

                resolve({
                    data: filteredData,
                    duration: audioBuffer.duration
                })
            }, (e) => {
                console.log(e);
                player.find('.loading').html(mc.i18n('system.error')).css('background-size', 0)
            });
        })
    }

    function visualize(data, timeline) {

        function bar(value, index) {
            if (index % 2 === 0) {
                let rect = $(document.createElement('rect'))
                let height = Math.ceil(value * 100)
                rect.attr('width', '2px')
                rect.attr('height', height + '%')
                rect.attr('y', 100 - height + '%')
                rect.attr('x', index + '%')
                rect.attr('fill', '#A09DC0')

                let filler = $(document.createElement('rect'))
                filler.attr('index', index)
                filler.attr('height', '100%')
                filler.attr('width', '3px')
                filler.attr('x', index + '%')
                filler.attr('fill', 'rgba(0,0,0,0)')

                return rect[0].outerHTML + filler[0].outerHTML
            }
        }

        let svg = ''
        for (let index in data) {
            let value = data[index]
            svg += bar(value, index)
        }

        $(timeline).html(svg);
        if (!$(timeline).parent().find('.loading').hasClass('hide'))
            $(timeline).parent().find('.loading').addClass('hide');
    }

    function initialVisualisation($player) {
        let bars = [];
        for (let i = 0; i < 100; i++) {
            bars.push(0.1)
        }
        visualize(bars, $player.find('.timeline'))
    }

    function fillTimeline(value, timeline, ps) {
        $(timeline).find('rect:not([index])').forEach((elem, i) => {
            if (value === 1) {
                elem.classList.remove('ps')
                elem.classList.remove('s')
            } else {
                if (i * 2 - 1 <= value) {
                    if (ps) {
                        elem.classList.add('ps')
                    } else {
                        elem.classList.add('s')
                    }

                } else {
                    if (ps) {
                        elem.classList.remove('ps')
                    } else {
                        elem.classList.remove('s')
                    }
                }
            }
        })
    }

    let events = {
        playback: {},
        record: {}
    }

    return async (params, file) => {
        file = await file();
        if (!!!file) {
            if (params.file) {
                file = params.file
            } else {
                file = false
            }
        }

        const id = 'player_' + Math.round(Math.random() * 1000000)

        const player = await player_view({
            file: file, id: id,
            duration: 0,
            position: 0,
            record: !!params.record
        })

        const audioInfo = (file, $player) => {
            analyze(file, $player).then(audioInfo => {
                if (audioInfo) {
                    visualize(audioInfo.data, $player.find('.timeline')[0])
                    $player.find('.timer .total').html(timeFilter(Math.floor(audioInfo.duration)))
                    const player_audio = $player.find('audio')[0];
                    player_audio.attributes.src.value = file;

                    const updatetime = (secs) => {
                        let progress = Math.floor(secs * 100 / audioInfo.duration) + 1;
                        fillTimeline(progress, $player.find('.timeline')[0])
                        $player.find('.timer .current').html(timeFilter(Math.floor(secs)))

                        $player.find('.progress .position').css('width', progress + '%')
                    }
                    $player.find('.timer').removeClass('hide');
                    $player.find('.progress').css('width', '150px');
                    $player.find('.record_time').addClass('hide');
                    $(player_audio).on('timeupdate', (e) => {
                        const secs = e.target.currentTime
                        updatetime(secs)
                    });

                    events.playback = {
                        play: () => {
                            if ($('.player.playing').length) {
                                $('.player.playing .mdi-pause')[0].click()
                            }
                            player_audio.play();
                            $player.find('button.mdi-play').addClass('hide');
                            $player.find('button.mdi-pause').removeClass('hide');
                            $player.addClass('playing');
                        },
                        pause: () => {
                            player_audio.pause();
                            console.log(player_audio);
                            $player.find('button.mdi-pause').addClass('hide');
                            $player.find('button.mdi-play').removeClass('hide');
                            $player.removeClass('playing');
                        },
                        stop: () => {
                            player_audio.pause();
                            player_audio.currentTime = 0;
                            $player.find('button.mdi-pause').addClass('hide');
                            $player.find('button.mdi-play').removeClass('hide');
                        }
                    }

                    $player.find('audio')[0].onended = events.playback.stop;

                    $player.find('button.mdi-stop').off('click', events.record.stop);

                    $player.find('button.mdi-play').on('click', events.playback.play);

                    $player.find('button.mdi-stop').on('click', events.playback.stop);

                    $player.find('button.mdi-pause').on('click', events.playback.pause);

                    $player.find('.timeline').on('mouseover', (e) => {
                        if (e.target.tagName == 'rect') {
                            const index = e.target.getAttribute('index')
                            if (index) {
                                fillTimeline(index, e.target.parentNode, true)
                            }
                        }
                    }).on('click', (e) => {
                        if (e.target.tagName == 'rect') {
                            const index = e.target.getAttribute('index')
                            if (index) {
                                player_audio.currentTime = Math.floor(audioInfo.duration * (index / 100))
                                mc.events.push('player.setPosition', {
                                    position: player_audio.currentTime,
                                    player: $player
                                })
                            }
                        }
                    })

                }
            })
        }

        const recorder = ($player) => {
            let time;
            events.record = {
                record: () => {
                    $player.addClass('recording');
                    $player.find('button.mdi-record').attr('disabled', true);
                    mc.events.off(['record.start', 'recorder.volumes'])
                    //mc.events.off('recorder.volumes');
                    mc.events.on('record.start', (start) => {
                        time = setInterval(function () {
                            const delta = Date.now() - start;
                            $player.find('.record_time > .total').html(timeFilter(Math.floor((delta / 1000))));
                        }, 1000);
                    });
                    mc.events.on('recorder.volumes', (volumes) => {
                        visualize(volumes, $player.find('.timeline'))
                    });
                    Recorder.start();
                },
                stop: () => {
                    mc.events.off(['record.stop', 'record.ready']);
                    // mc.events.off('record.ready');
                    mc.events.on('record.stop', () => {
                        clearInterval(time)
                    });
                    Recorder.stop();
                    $player.removeClass('recording');
                    $player.find('.mdi-close').removeAttr('disabled');
                    mc.events.on('record.ready', ({blob, url}) => {
                        $player[0].blob = blob;
                        $player.find('button.mdi-record').addClass('hide').removeAttr('disabled');
                        $player.find('button.mdi-play').removeClass('hide');
                        audioInfo(url, $player)
                    });
                }
            }
            initialVisualisation($player)
            $player.find('.timer').addClass('hide');
            $player.find('.progress').css('width', '185px');
            $player.find('.record_time').removeClass('hide').find('.total').html('00:00');
            $player.find('.mdi-play').addClass('hide');
            $player.find('.mdi-record').removeClass('hide');
            $player.find('button.mdi-stop').on('click', events.record.stop);
            $player.find('button.mdi-record').on('click', events.record.record);
        }

        let wait_load = setInterval(() => {
            let $player = $('#' + id);
            if ($player.length) {
                if (file) {
                    audioInfo(file, $player)
                }
                if (params.record && !file) {
                    recorder($player);
                    initialVisualisation($player)
                }

                $player.find('.mdi-download').on('click', (e) => {
                    fetch(file)
                      .then(resp => resp.blob())
                      .then(blob => {
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.style.display = 'none';
                          a.href = url;
                          a.download = file.split('/')[file.split('/').length - 1];
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          $(document.body).find(a).remove();
                      })
                      .catch((e) =>
                        console.log(e));
                })

                $player.find('.mdi-close').on('click', function (e) {
                    delete $player[0].blob
                    $(this).attr('disabled', true);
                    $player.hasClass('.playing') ? events.playback.stop() : void 0;
                    $player.hasClass('.recording') ? events.playback.stop() : void 0;
                    $player.find('button.mdi-stop').off('click', events.playback.stop);
                    $player.find('button.mdi-record').off('click', events.record.record);
                    recorder($player)
                })

                clearInterval(wait_load)

            }
        }, 300)

        return player
    }
});